import { v2 as cloudinary } from 'cloudinary';

// Конфигурация Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

export default cloudinary;

// Типы для загрузки
export interface UploadResult {
  public_id: string;
  secure_url: string;
  url: string;
  format: string;
  width: number;
  height: number;
  resource_type: string;
  created_at: string;
  bytes: number;
}

// Опции для загрузки изображений
export const imageUploadOptions = {
  folder: 'smartmedical',
  allowed_formats: ['jpg', 'jpeg', 'png', 'webp', 'gif'],
  transformation: [
    { quality: 'auto:good' },
    { fetch_format: 'auto' },
  ],
};

// Опции для загрузки видео
export const videoUploadOptions = {
  folder: 'smartmedical/videos',
  allowed_formats: ['mp4', 'webm', 'mov'],
  resource_type: 'video' as const,
  transformation: [
    { quality: 'auto:good' },
  ],
};

// Папки для разных типов контента
export const uploadFolders = {
  services: 'smartmedical/services',
  specialists: 'smartmedical/specialists',
  partners: 'smartmedical/partners',
  gallery: 'smartmedical/gallery',
  avatars: 'smartmedical/avatars',
};

// Функция для получения оптимизированного URL
export function getOptimizedImageUrl(
  publicId: string,
  options?: {
    width?: number;
    height?: number;
    crop?: string;
    quality?: string;
  }
): string {
  const { width, height, crop = 'fill', quality = 'auto:good' } = options || {};

  const transformations: string[] = [`q_${quality}`, 'f_auto'];

  if (width) transformations.push(`w_${width}`);
  if (height) transformations.push(`h_${height}`);
  if (width || height) transformations.push(`c_${crop}`);

  const transformationString = transformations.join(',');

  return `https://res.cloudinary.com/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload/${transformationString}/${publicId}`;
}

// Функция для получения URL видео
export function getVideoUrl(publicId: string): string {
  return `https://res.cloudinary.com/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/video/upload/q_auto/${publicId}`;
}

// Функция для удаления файла
export async function deleteFromCloudinary(publicId: string): Promise<boolean> {
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    return result.result === 'ok';
  } catch (error) {
    return false;
  }
}
