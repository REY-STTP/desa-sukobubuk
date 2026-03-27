import { v2 as cloudinary } from 'cloudinary'

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
  api_key: process.env.CLOUDINARY_API_KEY!,
  api_secret: process.env.CLOUDINARY_API_SECRET!,
})

/**
 * Upload buffer ke Cloudinary.
 * @param buffer  - File buffer
 * @param folder  - Folder di Cloudinary (contoh: 'desa-sukobubuk/berita')
 * @param options - Opsi tambahan (transformation, public_id, dll)
 */
export async function uploadToCloudinary(
  buffer: Buffer,
  folder: string,
  options: Record<string, unknown> = {}
): Promise<{ url: string; public_id: string }> {
  return new Promise((resolve, reject) => {
    cloudinary.uploader
      .upload_stream(
        {
          folder: `desa-sukobubuk/${folder}`,
          resource_type: 'image',
          ...options,
        },
        (error, result) => {
          if (error || !result) return reject(error ?? new Error('Upload gagal'))
          resolve({ url: result.secure_url, public_id: result.public_id })
        }
      )
      .end(buffer)
  })
}

/**
 * Hapus gambar dari Cloudinary berdasarkan public_id.
 * Aman dipanggil meski public_id tidak ada (tidak throw).
 */
export async function deleteFromCloudinary(public_id: string): Promise<void> {
  try {
    await cloudinary.uploader.destroy(public_id)
  } catch {
    // Tidak perlu throw — file mungkin sudah terhapus sebelumnya
  }
}

/**
 * Ambil public_id dari URL Cloudinary.
 * Contoh: "https://res.cloudinary.com/demo/image/upload/v123/desa-sukobubuk/berita/abc.jpg"
 * → "desa-sukobubuk/berita/abc"
 */
export function getPublicIdFromUrl(url: string): string | null {
  try {
    const match = url.match(/\/upload\/(?:v\d+\/)?(.+?)(?:\.[a-z]+)?$/)
    return match ? match[1] : null
  } catch {
    return null
  }
}

export default cloudinary