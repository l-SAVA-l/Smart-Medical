import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getToken } from 'next-auth/jwt';

// Middleware для проверки админа
async function checkAdmin(request: NextRequest) {
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET
  });

  if (!token || !token.id) {
    return { isAdmin: false, error: 'Не авторизован' };
  }

  const userId = parseInt(token.id as string);
  const user = await prisma.patient.findUnique({
    where: { id: userId },
    select: { role: true },
  });

  if (!user || (user.role !== 'ADMIN' && user.role !== 'CHIEF_DOCTOR')) {
    return { isAdmin: false, error: 'Нет доступа' };
  }

  return { isAdmin: true };
}

// GET - получить контакты
export async function GET(request: NextRequest) {
  try {
    const adminCheck = await checkAdmin(request);
    if (!adminCheck.isAdmin) {
      return NextResponse.json({ error: adminCheck.error }, { status: 401 });
    }

    const contacts = await prisma.contacts.findFirst();

    if (!contacts) {
      return NextResponse.json({ error: 'Contacts not found' }, { status: 404 });
    }

    return NextResponse.json(contacts);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch contacts' }, { status: 500 });
  }
}

// PUT - обновить контакты
export async function PUT(request: NextRequest) {
  try {
    const adminCheck = await checkAdmin(request);
    if (!adminCheck.isAdmin) {
      return NextResponse.json({ error: adminCheck.error }, { status: 401 });
    }

    const body = await request.json();
    const {
      address,
      map_geo,
      work_hours_main,
      work_hours_sunday,
      phone_number,
      phone_number_sec,
      email,
    } = body;

    // Валидация обязательных полей
    if (!address || !phone_number || !email) {
      return NextResponse.json(
        { error: 'Адрес, телефон и email обязательны' },
        { status: 400 }
      );
    }

    // Находим существующую запись или создаём новую
    const existingContacts = await prisma.contacts.findFirst();

    let contacts;
    if (existingContacts) {
      contacts = await prisma.contacts.update({
        where: { id: existingContacts.id },
        data: {
          address,
          map_geo: map_geo || '',
          work_hours_main: work_hours_main || '',
          work_hours_sunday: work_hours_sunday || '',
          phone_number,
          phone_number_sec: phone_number_sec || null,
          email,
        },
      });
    } else {
      contacts = await prisma.contacts.create({
        data: {
          address,
          map_geo: map_geo || '',
          work_hours_main: work_hours_main || '',
          work_hours_sunday: work_hours_sunday || '',
          phone_number,
          phone_number_sec: phone_number_sec || null,
          email,
        },
      });
    }

    return NextResponse.json(contacts);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update contacts' }, { status: 500 });
  }
}
