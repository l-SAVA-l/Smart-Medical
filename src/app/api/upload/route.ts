import { NextRequest, NextResponse } from 'next/server';
import cloudinary, { uploadFolders, UploadResult } from '@/lib/cloudinary';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const folder = formData.get('folder') as string || 'smartmedical';
    const resourceType = formData.get('resourceType') as 'image' | 'video' || 'image';

    if (!file) {
      return NextResponse.json(
        { error: 'Файл не предоставлен' },
        { status: 400 }
      );
    }

    // Проверка размера файла (10MB для изображений, 100MB для видео)
    const maxSize = resourceType === 'video' ? 100 * 1024 * 1024 : 10 * 1024 * 1024;
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: `Файл слишком большой. Максимум: ${maxSize / (1024 * 1024)}MB` },
        { status: 400 }
      );
    }

    // Проверка типа файла
    const allowedImageTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    const allowedVideoTypes = ['video/mp4', 'video/webm', 'video/quicktime'];
    const allowedTypes = resourceType === 'video' ? allowedVideoTypes : allowedImageTypes;

    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: `Недопустимый тип файла. Разрешены: ${allowedTypes.join(', ')}` },
        { status: 400 }
      );
    }

    // Конвертируем файл в буфер
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Загружаем в Cloudinary
    const result = await new Promise<UploadResult>((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: folder,
          resource_type: resourceType,
          transformation: resourceType === 'image'
            ? [{ quality: 'auto:good' }, { fetch_format: 'auto' }]
            : [{ quality: 'auto:good' }],
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result as UploadResult);
        }
      );

      uploadStream.end(buffer);
    });

    return NextResponse.json({
      success: true,
      data: {
        public_id: result.public_id,
        url: result.secure_url,
        format: result.format,
        width: result.width,
        height: result.height,
        resource_type: result.resource_type,
        bytes: result.bytes,
      }
    });

  } catch (error) {
    return NextResponse.json(
      { error: 'Ошибка при загрузке файла' },
      { status: 500 }
    );
  }
}

// GET endpoint для получения подписи для прямой загрузки с клиента
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const folder = searchParams.get('folder') || 'smartmedical';

    const timestamp = Math.round(new Date().getTime() / 1000);

    const signature = cloudinary.utils.api_sign_request(
      {
        timestamp,
        folder,
      },
      process.env.CLOUDINARY_API_SECRET!
    );

    return NextResponse.json({
      signature,
      timestamp,
      cloudName: process.env.CLOUDINARY_CLOUD_NAME,
      apiKey: process.env.CLOUDINARY_API_KEY,
      folder,
    });

  } catch (error) {
    return NextResponse.json(
      { error: 'Ошибка при генерации подписи' },
      { status: 500 }
    );
  }
}
