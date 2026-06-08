'use client';

import { CldImage } from 'next-cloudinary';
import { useState } from 'react';
import { ImageOff } from 'lucide-react';

interface CloudinaryImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  fill?: boolean;
  priority?: boolean;
  sizes?: string;
  crop?: 'fill' | 'scale' | 'fit' | 'pad' | 'thumb';
  gravity?: 'auto' | 'face' | 'center';
  quality?: 'auto' | number;
}

export function CloudinaryImage({
  src,
  alt,
  width,
  height,
  className = '',
  fill = false,
  priority = false,
  sizes,
  crop = 'fill',
  gravity = 'auto',
  quality = 'auto',
}: CloudinaryImageProps) {
  const [error, setError] = useState(false);

  // Проверяем, является ли src Cloudinary public_id или обычным URL
  const isCloudinaryImage = !src.startsWith('http') && !src.startsWith('/');

  if (error || !src) {
    return (
      <div className={`bg-gray-100 flex items-center justify-center ${className}`}>
        <ImageOff className="w-8 h-8 text-gray-400" />
      </div>
    );
  }

  // Если это не Cloudinary изображение, используем обычный img
  if (!isCloudinaryImage) {
    return (
      <img
        src={src}
        alt={alt}
        className={className}
        onError={() => setError(true)}
        style={fill ? { objectFit: 'cover', width: '100%', height: '100%' } : undefined}
      />
    );
  }

  // Используем CldImage для Cloudinary изображений
  return (
    <CldImage
      src={src}
      alt={alt}
      width={width || 800}
      height={height || 600}
      className={className}
      fill={fill}
      priority={priority}
      sizes={sizes}
      crop={crop}
      gravity={gravity}
      quality={quality}
      onError={() => setError(true)}
    />
  );
}

// Компонент для видео из Cloudinary
export function CloudinaryVideo({
  src,
  className = '',
  controls = true,
  autoPlay = false,
  muted = false,
  loop = false,
}: {
  src: string;
  className?: string;
  controls?: boolean;
  autoPlay?: boolean;
  muted?: boolean;
  loop?: boolean;
}) {
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;

  // Если это полный URL, используем его напрямую
  const videoUrl = src.startsWith('http')
    ? src
    : `https://res.cloudinary.com/${cloudName}/video/upload/q_auto/${src}`;

  return (
    <video
      src={videoUrl}
      className={className}
      controls={controls}
      autoPlay={autoPlay}
      muted={muted}
      loop={loop}
    />
  );
}
