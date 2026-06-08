import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';

export async function POST() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Проверяем, что пользователь - главный врач
    const patient = await prisma.patient.findUnique({
      where: { email: session.user.email },
      select: { role: true },
    });

    if (!patient || patient.role !== 'CHIEF_DOCTOR') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Помечаем все письма как прочитанные
    await prisma.letter.updateMany({
      where: {
        OR: [
          { is_read: false },
          { has_new_patient_message: true },
        ],
      },
      data: {
        is_read: true,
        has_new_patient_message: false,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to mark letters as read' },
      { status: 500 }
    );
  }
}
