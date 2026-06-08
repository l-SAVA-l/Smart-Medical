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

// GET - получить услуги с пагинацией
export async function GET(request: NextRequest) {
  try {
    const adminCheck = await checkAdmin(request);
    if (!adminCheck.isAdmin) {
      return NextResponse.json({ error: adminCheck.error }, { status: 401 });
    }

    // Получаем параметры пагинации и поиска
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '12');
    const search = searchParams.get('search') || '';

    // Формируем условия поиска
    const whereCondition = search
      ? {
          OR: [
            { title: { contains: search, mode: 'insensitive' as const } },
            { subtitle: { contains: search, mode: 'insensitive' as const } },
            { serviceCategory: { name: { contains: search, mode: 'insensitive' as const } } },
          ],
        }
      : {};

    // Подсчитываем общее количество
    const totalCount = await prisma.service.count({
      where: whereCondition,
    });

    // Получаем услуги для текущей страницы
    const services = await prisma.service.findMany({
      where: whereCondition,
      include: {
        serviceCategory: true,
        specialists: {
          include: {
            specialist: true,
          },
        },
      },
      orderBy: {
        title: 'asc',
      },
      skip: (page - 1) * limit,
      take: limit,
    });

    // Transform data to match expected format
    const transformedServices = services.map(service => ({
      ...service,
      specialists: service.specialists.map(ss => ss.specialist),
    }));

    return NextResponse.json({
      data: transformedServices,
      totalCount,
      page,
      limit,
      totalPages: Math.ceil(totalCount / limit),
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch services' }, { status: 500 });
  }
}

// POST - создать услугу
export async function POST(request: NextRequest) {
  try {
    const adminCheck = await checkAdmin(request);
    if (!adminCheck.isAdmin) {
      return NextResponse.json({ error: adminCheck.error }, { status: 401 });
    }

    const body = await request.json();
    const {
      title,
      subtitle,
      price,
      video_url,
      description,
      specialist_ids,
      image_url,
      image_url_1,
      image_url_2,
      image_url_3,
      image_url_4,
      service_category_id,
    } = body;

    // Валидация обязательных полей
    if (!title || !subtitle || !price || !service_category_id || !specialist_ids || specialist_ids.length === 0) {
      return NextResponse.json(
        { error: 'Название, подзаголовок, цена, категория и хотя бы один специалист обязательны' },
        { status: 400 }
      );
    }

    const service = await prisma.service.create({
      data: {
        title,
        subtitle,
        price: parseInt(price),
        video_url: video_url || '',
        description: description || '',
        image_url: image_url || '',
        image_url_1: image_url_1 || '',
        image_url_2: image_url_2 || '',
        image_url_3: image_url_3 || '',
        image_url_4: image_url_4 || null,
        questions_id: 1,
        reviews_id: 1,
        service_category_id: parseInt(service_category_id),
        specialists: {
          create: specialist_ids.map((id: string) => ({
            specialist_id: parseInt(id),
          })),
        },
      },
      include: {
        serviceCategory: true,
        specialists: {
          include: {
            specialist: true,
          },
        },
      },
    });

    // Transform data to match expected format
    const transformedService = {
      ...service,
      specialists: service.specialists.map(ss => ss.specialist),
    };

    return NextResponse.json(transformedService, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create service' }, { status: 500 });
  }
}
