import { MenuItem } from '../types/index';

export const menuItems: MenuItem[] = [
  // Minuman (4 items)
  {
    id: 'MNU-001',
    name: 'Espresso',
    description: 'Kopi espresso pekat dengan cita rasa kuat dan aroma yang intens.',
    price: 18000,
    category: 'Minuman',
    imageUrl: '/images/espresso.jpg',
    stock: 20,
  },
  {
    id: 'MNU-002',
    name: 'Cappuccino',
    description: 'Espresso dengan susu dikukus dan busa susu lembut di atasnya.',
    price: 25000,
    category: 'Minuman',
    imageUrl: '/images/cappuccino.jpg',
    stock: 20,
  },
  {
    id: 'MNU-003',
    name: 'Matcha Latte',
    description: 'Teh matcha Jepang berkualitas tinggi dipadukan dengan susu segar.',
    price: 28000,
    category: 'Minuman',
    imageUrl: '/images/matcha-latte.jpg',
    stock: 20,
  },
  {
    id: 'MNU-004',
    name: 'Kopi Susu',
    description: 'Kopi robusta pilihan dengan susu kental manis, khas kopi susu lokal.',
    price: 22000,
    category: 'Minuman',
    imageUrl: '/images/kopi-susu.jpg',
    stock: 20,
  },
  // Makanan (3 items)
  {
    id: 'MNU-005',
    name: 'Croissant',
    description: 'Croissant renyah berlapis mentega dengan tekstur ringan dan gurih.',
    price: 32000,
    category: 'Makanan',
    imageUrl: '/images/croissant.jpg',
    stock: 20,
  },
  {
    id: 'MNU-006',
    name: 'Sandwich Keju',
    description: 'Sandwich roti gandum isi keju cheddar, selada, dan tomat segar.',
    price: 38000,
    category: 'Makanan',
    imageUrl: '/images/sandwich-keju.jpg',
    stock: 20,
  },
  {
    id: 'MNU-007',
    name: 'Roti Bakar',
    description: 'Roti tawar panggang dengan pilihan topping selai cokelat atau keju.',
    price: 20000,
    category: 'Makanan',
    imageUrl: '/images/roti-bakar.jpg',
    stock: 20,
  },
  // Snack (2 items)
  {
    id: 'MNU-008',
    name: 'Kentang Goreng',
    description: 'Kentang goreng renyah dengan bumbu garam dan saus sambal pilihan.',
    price: 18000,
    category: 'Snack',
    imageUrl: '/images/kentang-goreng.jpg',
    stock: 20,
  },
  {
    id: 'MNU-009',
    name: 'Pisang Goreng',
    description: 'Pisang kepok goreng dengan balutan tepung crispy, disajikan hangat.',
    price: 15000,
    category: 'Snack',
    imageUrl: '/images/pisang-goreng.jpg',
    stock: 20,
  },
];

export default menuItems;
