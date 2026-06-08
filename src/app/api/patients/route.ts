import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const patients = await prisma.patient.findMany({
      select: {
        id: true,
        login: true,
        email: true,
        name: true,
        phone: true,
        registration_date: true,
        // Не возвращаем password по соображениям безопасности
      },
      orderBy: {
        registration_date: 'desc',
      },
    });

    return NextResponse.json({ patients }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch patients' },
      { status: 500 }
    );
  }
}

