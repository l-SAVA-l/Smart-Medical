import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getToken } from "next-auth/jwt";
import cloudinary, { UploadResult } from "@/lib/cloudinary";

export async function POST(request: NextRequest) {
  try {
    // Получаем токен из cookies
    const token = await getToken({
      req: request,
      secret: process.env.NEXTAUTH_SECRET
    });

    if (!token || !token.id) {
      return NextResponse.json(
        { error: "Не авторизован" },
        { status: 401 }
      );
    }

    const userId = parseInt(token.id as string);

    const formData = await request.formData();
    const file = formData.get("avatar") as File | null;

    if (!file) {
      return NextResponse.json(
        { error: "Файл не предоставлен" },
        { status: 400 }
      );
    }

    // Проверяем тип файла
    const allowedTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: "Недопустимый формат файла. Разрешены: JPEG, PNG, GIF, WebP" },
        { status: 400 }
      );
    }

    // Проверяем размер файла (максимум 5MB)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: "Размер файла не должен превышать 5MB" },
        { status: 400 }
      );
    }

    // Получаем текущего пользователя для удаления старого аватара
    const currentUser = await prisma.patient.findUnique({
      where: { id: userId },
      select: { avatar_url: true },
    });

    // Удаляем старый аватар из Cloudinary если он есть
    if (currentUser?.avatar_url && currentUser.avatar_url.includes('cloudinary')) {
      try {
        // Извлекаем public_id из URL
        const urlParts = currentUser.avatar_url.split('/');
        const publicIdWithExt = urlParts.slice(-2).join('/'); // folder/filename
        const publicId = publicIdWithExt.replace(/\.[^/.]+$/, ''); // убираем расширение
        await cloudinary.uploader.destroy(publicId);
      } catch (deleteError) {
        // Продолжаем загрузку нового аватара даже если удаление не удалось
      }
    }

    // Конвертируем файл в буфер
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Загружаем в Cloudinary
    const result = await new Promise<UploadResult>((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: 'smartmedical/avatars',
          public_id: `user_${userId}_${Date.now()}`,
          transformation: [
            { width: 400, height: 400, crop: 'fill', gravity: 'face' },
            { quality: 'auto:good' },
            { fetch_format: 'auto' }
          ],
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result as UploadResult);
        }
      );

      uploadStream.end(buffer);
    });

    // Обновляем пользователя в базе данных
    await prisma.patient.update({
      where: { id: userId },
      data: { avatar_url: result.secure_url },
    });

    return NextResponse.json(
      {
        message: "Аватар успешно загружен",
        avatar_url: result.secure_url
      },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: "Ошибка при загрузке аватара" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    // Получаем токен из cookies
    const token = await getToken({
      req: request,
      secret: process.env.NEXTAUTH_SECRET
    });

    if (!token || !token.id) {
      return NextResponse.json(
        { error: "Не авторизован" },
        { status: 401 }
      );
    }

    const userId = parseInt(token.id as string);

    // Получаем текущего пользователя
    const currentUser = await prisma.patient.findUnique({
      where: { id: userId },
      select: { avatar_url: true },
    });

    // Удаляем аватар из Cloudinary если он есть
    if (currentUser?.avatar_url && currentUser.avatar_url.includes('cloudinary')) {
      try {
        // Извлекаем public_id из URL
        const urlParts = currentUser.avatar_url.split('/');
        const folderAndFile = urlParts.slice(-2).join('/'); // smartmedical/avatars/filename
        const publicId = `smartmedical/avatars/${folderAndFile.split('/').pop()?.replace(/\.[^/.]+$/, '')}`;
        await cloudinary.uploader.destroy(publicId);
      } catch (deleteError) {
      }
    }

    // Удаляем аватар из базы данных
    await prisma.patient.update({
      where: { id: userId },
      data: { avatar_url: null },
    });

    return NextResponse.json(
      { message: "Аватар успешно удален" },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: "Ошибка при удалении аватара" },
      { status: 500 }
    );
  }
}
