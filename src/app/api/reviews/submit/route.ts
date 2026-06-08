import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { validateFeedback, validateEmail } from '@/utils/validation';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, text, grade, image_url } = body;

    // Базовая валидация наличия полей
    if (!name || !email || !text || grade === undefined) {
      return NextResponse.json(
        { error: 'Все поля обязательны для заполнения' },
        { status: 400 }
      );
    }

    // Валидация имени (мин. 2 символа, без цифр)
    if (name.trim().length < 2) {
      return NextResponse.json(
        { error: 'Имя должно содержать минимум 2 символа' },
        { status: 400 }
      );
    }

    if (/\d/.test(name)) {
      return NextResponse.json(
        { error: 'Имя не должно содержать цифры' },
        { status: 400 }
      );
    }

    // Валидация email
    const emailValidation = validateEmail(email);
    if (!emailValidation.isValid) {
      return NextResponse.json(
        { error: emailValidation.error },
        { status: 400 }
      );
    }

    // Валидация текста отзыва (мин. 10 символов, макс 2000)
    if (text.trim().length < 10) {
      return NextResponse.json(
        { error: 'Текст отзыва должен содержать минимум 10 символов' },
        { status: 400 }
      );
    }

    if (text.length > 2000) {
      return NextResponse.json(
        { error: 'Текст отзыва не должен превышать 2000 символов' },
        { status: 400 }
      );
    }

    // Валидация оценки
    if (grade < 1 || grade > 5) {
      return NextResponse.json(
        { error: 'Оценка должна быть от 1 до 5' },
        { status: 400 }
      );
    }

    // Создаем отзыв с verified = false (на модерации)
    const review = await prisma.feedback.create({
      data: {
        name,
        text,
        grade: parseInt(grade.toString()),
        date: new Date(),
        image_url: image_url || '',
        verified: false, // Требует модерации
        service_id: null, // Общий отзыв клиники
      },
    });

    return NextResponse.json(
      { message: 'Отзыв успешно отправлен на модерацию', id: review.id },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: 'Не удалось отправить отзыв' },
      { status: 500 }
    );
  }
}
