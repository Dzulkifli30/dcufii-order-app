import { v2 as cloudinary } from 'cloudinary';

export const runtime = 'nodejs';

function configureCloudinary() {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;
  if (!cloudName || !apiKey || !apiSecret) throw new Error('Cloudinary belum dikonfigurasi di environment server.');
  cloudinary.config({ cloud_name: cloudName, api_key: apiKey, api_secret: apiSecret, secure: true });
}

export async function POST(request: Request) {
  try {
    configureCloudinary();
    const formData = await request.formData();
    const file = formData.get('file');
    const menuId = String(formData.get('menuId') ?? '');
    if (!(file instanceof File) || !file.type.startsWith('image/')) return Response.json({ error: 'File harus berupa gambar.' }, { status: 400 });
    if (file.size > 5 * 1024 * 1024) return Response.json({ error: 'Ukuran gambar maksimal 5 MB.' }, { status: 400 });
    if (!menuId) return Response.json({ error: 'ID menu wajib diisi.' }, { status: 400 });
    const buffer = Buffer.from(await file.arrayBuffer());
    const publicId = `${menuId}-${Date.now()}`;
    const result = await new Promise<{ secure_url: string; public_id: string }>((resolve, reject) => {
      const upload = cloudinary.uploader.upload_stream({ folder: 'dcufii/menu', public_id: publicId, overwrite: false, resource_type: 'image' }, (error, uploaded) => {
        if (error || !uploaded?.secure_url || !uploaded.public_id) reject(error ?? new Error('Cloudinary tidak mengembalikan hasil upload.'));
        else resolve({ secure_url: uploaded.secure_url, public_id: uploaded.public_id });
      });
      upload.end(buffer);
    });
    return Response.json({ secureUrl: result.secure_url, publicId: result.public_id });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : 'Upload gambar gagal.' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    configureCloudinary();
    const { publicId } = await request.json() as { publicId?: string };
    if (!publicId || !publicId.startsWith('dcufii/menu/')) return Response.json({ error: 'Public ID gambar tidak valid.' }, { status: 400 });
    await cloudinary.uploader.destroy(publicId, { resource_type: 'image' });
    return Response.json({ ok: true });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : 'Penghapusan gambar gagal.' }, { status: 500 });
  }
}