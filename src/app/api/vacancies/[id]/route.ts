import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: idParam } = await params;
    const id = parseInt(idParam);

    if (isNaN(id)) {
      return NextResponse.json(
        { error: 'Invalid vacancy ID' },
        { status: 400 }
      );
    }

    const vacancy = await prisma.vacancy.findUnique({
      where: { id },
    });

    if (!vacancy) {
      return NextResponse.json(
        { error: 'Vacancy not found' },
        { status: 404 }
      );
    }

    const formattedVacancy = {
      id: vacancy.id.toString(),
      title: vacancy.name,
      department: vacancy.category,
      description: vacancy.description,
      salary: vacancy.payment ? `от ${vacancy.payment} BYN` : undefined,
      type: 'full-time' as const, // По умолчанию полная занятость
      experience: vacancy.experience ? `от ${vacancy.experience} лет` : 'не требуется',
      requirements: vacancy.requirements 
        ? vacancy.requirements
            .split(',') // Разбиваем по запятым
            .map(r => r.trim()) // Убираем пробелы в начале и конце
            .map(r => r.replace(/\.$/, '')) // Убираем точку в конце, если есть
            .filter(r => r.length > 0) // Убираем пустые строки
        : [],
      responsibilities: [], 
    };

    return NextResponse.json(formattedVacancy);
  } catch (error) {
    console.error('Error fetching vacancy:', error);
    return NextResponse.json(
      { error: 'Failed to fetch vacancy' },
      { status: 500 }
    );
  }
}

