import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Проверяем, что пользователь - админ
    const patient = await prisma.patient.findUnique({
      where: { email: session.user.email },
      select: { role: true },
    });

    if (!patient || !['ADMIN', 'CHIEF_DOCTOR', 'OPERATOR'].includes(patient.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Получаем количество непроверенных отзывов
    const unreadFeedbacksCount = await prisma.feedback.count({
      where: {
        verified: false,
      },
    });

    // Получаем количество непрочитанных писем (только для главного врача)
    let unreadLettersCount = 0;
    if (patient.role === 'CHIEF_DOCTOR') {
      unreadLettersCount = await prisma.letter.count({
        where: {
          OR: [
            { is_read: false },
            { has_new_patient_message: true },
          ],
        },
      });
    }

    // Получаем количество непрочитанных чатов (для операторов, админов и главврача)
    let unreadChatsCount = 0;
    if (['OPERATOR', 'ADMIN', 'CHIEF_DOCTOR'].includes(patient.role)) {
      unreadChatsCount = await prisma.operatorChat.count({
        where: {
          has_unread_operator: true,
        },
      });
    }

    return NextResponse.json({
      feedbacks: unreadFeedbacksCount,
      letters: unreadLettersCount,
      chats: unreadChatsCount,
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch unread counts' },
      { status: 500 }
    );
  }
}
