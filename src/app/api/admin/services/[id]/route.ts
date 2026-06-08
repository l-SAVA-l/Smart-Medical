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

// GET - получить одну услугу
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const adminCheck = await checkAdmin(request);
    if (!adminCheck.isAdmin) {
      return NextResponse.json({ error: adminCheck.error }, { status: 401 });
    }

    const { id } = await params;
    const serviceId = parseInt(id);

    const service = await prisma.service.findUnique({
      where: { id: serviceId },
      include: {
        serviceCategory: true,
        specialists: {
          include: {
            specialist: true,
          },
        },
      },
    });

    if (!service) {
      return NextResponse.json({ error: 'Service not found' }, { status: 404 });
    }

    // Transform data to match expected format
    const transformedService = {
      ...service,
      specialists: service.specialists.map(ss => ss.specialist),
    };

    return NextResponse.json(transformedService);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch service' }, { status: 500 });
  }
}

// PUT - обновить услугу
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const adminCheck = await checkAdmin(request);
    if (!adminCheck.isAdmin) {
      return NextResponse.json({ error: adminCheck.error }, { status: 401 });
    }

    const { id } = await params;
    const serviceId = parseInt(id);
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

    // Update service and replace specialists
    const service = await prisma.service.update({
      where: { id: serviceId },
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
        service_category_id: parseInt(service_category_id),
        specialists: {
          // Delete existing relations and create new ones
          deleteMany: {},
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

    return NextResponse.json(transformedService);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update service' }, { status: 500 });
  }
}

// DELETE - удалить услугу
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const adminCheck = await checkAdmin(request);
    if (!adminCheck.isAdmin) {
      return NextResponse.json({ error: adminCheck.error }, { status: 401 });
    }

    const { id } = await params;
    const serviceId = parseInt(id);

    await prisma.service.delete({
      where: { id: serviceId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete service' }, { status: 500 });
  }
}
