# Cloudinary untuk Gambar Menu

1. Buat akun gratis di [Cloudinary](https://cloudinary.com/).
2. Dari Dashboard, buka **Product Environment Credentials**.
3. Salin Cloud name, API key, dan API secret ke `.env.local`:

```env
CLOUDINARY_CLOUD_NAME=isi_cloud_name
CLOUDINARY_API_KEY=isi_api_key
CLOUDINARY_API_SECRET=isi_api_secret
```

Jangan memakai prefix `NEXT_PUBLIC_` untuk nilai Cloudinary. API secret hanya boleh berada di server dan jangan dikirim ke repository atau chat.

Aplikasi mengunggah gambar melalui endpoint server `POST /api/admin/images` ke folder Cloudinary `dcufii/menu`. URL aman dan `public_id` disimpan di Firestore. Saat gambar diganti atau menu dihapus, `public_id` lama digunakan untuk menghapus aset Cloudinary.

Setelah mengubah `.env.local`, restart server:

```bash
npm run dev
```

Firebase Storage tidak perlu diaktifkan dan tidak perlu menjalankan deploy Storage rules. Firebase tetap digunakan untuk Authentication dan Firestore.