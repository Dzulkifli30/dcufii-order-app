// lib/orderService.ts
import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  runTransaction,
  serverTimestamp,
} from 'firebase/firestore';
import { db, isFirebaseConfigured } from './firebase';
import type { Order, OrderState, CartItem, MenuItem, OrderStatus } from '@/types';

function normalizeStatus(status: unknown): OrderStatus {
  if (status === 'PENDING') return 'pending';
  if (status === 'menunggu pembayaran' || status === 'pending' || status === 'selesai') return status;
  throw new Error('Status pesanan tidak dikenali.');
}

export async function saveOrder(
  orderState: OrderState,
  cartItems: CartItem[],
  menuData: MenuItem[],
  totalPrice: number
) {
  try {
    if (!isFirebaseConfigured) return `local-${Date.now()}`;

    // Map data cart menjadi lebih lengkap untuk database
    const orderItems = cartItems.map(item => {
      const menu = menuData.find(m => m.id === item.menuItemId);
      return {
        menuItemId: item.menuItemId,
        name: menu?.name || 'Unknown',
        quantity: item.quantity,
        price: menu?.price || 0,
        note: item.note
      };
    });

    const orderRef = doc(collection(db, 'orders'));
    const menuRefs = orderItems.map((item) => doc(db, 'menus', item.menuItemId));

    await runTransaction(db, async (transaction) => {
      const menuSnapshots = await Promise.all(menuRefs.map((menuRef) => transaction.get(menuRef)));

      if (orderState.paymentMethod !== 'CASH') {
        menuSnapshots.forEach((menuSnapshot, index) => {
          const stock = Number(menuSnapshot.data()?.stock ?? 0);
          const quantity = orderItems[index].quantity;
          if (!menuSnapshot.exists() || stock < quantity) {
            throw new Error(`Stok ${orderItems[index].name} tidak mencukupi.`);
          }
          transaction.update(menuRefs[index], { stock: stock - quantity, updatedAt: serverTimestamp() });
        });
      }

      transaction.set(orderRef, {
        customerName: orderState.customerName,
        tableNumber: orderState.tableNumber,
        paymentMethod: orderState.paymentMethod,
        totalPrice,
        items: orderItems,
        status: orderState.paymentMethod === 'CASH' ? 'menunggu pembayaran' : 'pending',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    });

    return orderRef.id;
  } catch (error) {
    console.error("Gagal menyimpan pesanan: ", error);
    throw error;
  }
}

export async function getOrders(): Promise<Order[]> {
  if (!isFirebaseConfigured) return [];
  const snapshot = await getDocs(query(collection(db, 'orders'), orderBy('createdAt', 'desc')));
  return snapshot.docs.map((snapshotDoc) => {
    const data = snapshotDoc.data();
    return {
      id: snapshotDoc.id,
      customerName: String(data.customerName ?? ''),
      tableNumber: Number(data.tableNumber),
      paymentMethod: data.paymentMethod,
      totalPrice: Number(data.totalPrice ?? 0),
      items: Array.isArray(data.items) ? data.items : [],
      status: normalizeStatus(data.status),
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
    };
  });
}

export async function updateOrderStatus(order: Order, nextStatus: OrderStatus) {
  const allowed = order.status === 'menunggu pembayaran' && nextStatus === 'pending'
    || order.status === 'pending' && nextStatus === 'selesai';
  if (!allowed) throw new Error('Perubahan status pesanan tidak diperbolehkan.');
  if (order.status === 'menunggu pembayaran' && order.paymentMethod !== 'CASH') {
    throw new Error('Hanya pesanan tunai yang menunggu pembayaran.');
  }
  if (!isFirebaseConfigured) return;
  await runTransaction(db, async (transaction) => {
    const orderRef = doc(db, 'orders', order.id);
    const orderSnapshot = await transaction.get(orderRef);
    const currentStatus = normalizeStatus(orderSnapshot.data()?.status);
    if (currentStatus !== order.status) throw new Error('Pesanan sudah diperbarui oleh operator lain.');

    if (order.status === 'menunggu pembayaran') {
      const menuRefs = order.items.map((item) => doc(db, 'menus', item.menuItemId));
      const menuSnapshots = await Promise.all(menuRefs.map((menuRef) => transaction.get(menuRef)));
      menuSnapshots.forEach((menuSnapshot, index) => {
        const stock = Number(menuSnapshot.data()?.stock ?? 0);
        const quantity = order.items[index].quantity;
        if (!menuSnapshot.exists() || stock < quantity) {
          throw new Error(`Stok ${order.items[index].name} tidak mencukupi.`);
        }
        transaction.update(menuRefs[index], { stock: stock - quantity, updatedAt: serverTimestamp() });
      });
    }

    transaction.update(orderRef, {
      status: nextStatus,
      updatedAt: serverTimestamp(),
    });
  });
}

export async function getOrderById(orderId: string): Promise<Order | null> {
  if (!isFirebaseConfigured) return null;
  const orderSnapshot = await getDoc(doc(db, 'orders', orderId));
  if (!orderSnapshot.exists()) return null;
  const data = orderSnapshot.data();
  return {
    id: orderSnapshot.id,
    customerName: String(data.customerName ?? ''),
    tableNumber: Number(data.tableNumber),
    paymentMethod: data.paymentMethod,
    totalPrice: Number(data.totalPrice ?? 0),
    items: Array.isArray(data.items) ? data.items : [],
    status: normalizeStatus(data.status),
    createdAt: data.createdAt,
    updatedAt: data.updatedAt,
  };
}

export function filterOrdersByStatus(orders: Order[], status: OrderStatus) {
  return orders.filter((order) => order.status === status);
}