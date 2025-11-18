import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const vacancies = await prisma.vacancy.findMany({
      orderBy: {
        id: 'asc',
      },
    });

    return NextResponse.json(vacancies);
  } catch (error) {
    console.error('Error fetching vacancies:', error);
    return NextResponse.json(
      { error: 'Failed to fetch vacancies' },
      { status: 500 }
    );
  }
}
