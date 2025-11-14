import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const vacancies = await prisma.vacancy.findMany({
      orderBy: {
        id: 'asc',
      },
    });

    const formattedVacancies = vacancies.map((vacancy) => ({
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
    }));

    return NextResponse.json(formattedVacancies);
  } catch (error) {
    console.error('Error fetching vacancies:', error);
    return NextResponse.json(
      { error: 'Failed to fetch vacancies' },
      { status: 500 }
    );
  }
}

