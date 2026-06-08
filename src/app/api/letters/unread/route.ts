import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getToken } from "next-auth/jwt";

// GET - Получить количество непрочитанных ответов от главврача
export async function GET(request: NextRequest) {
  try {
    const token = await getToken({
      req: request,
      secret: process.env.NEXTAUTH_SECRET
    });

    if (!token || !token.id) {
      return NextResponse.json(
        { error: "Не авторизован" },
        { status: 401 }
      );
    }

    const userId = parseInt(token.id as string);

    // Находим письма с непрочитанными ответами (первый ответ)
    const lettersWithUnreadReply = await prisma.letter.findMany({
      where: {
        patient_id: userId,
        reply: { not: null },
        is_reply_read: false,
      },
      select: {
        id: true,
        subject: true,
        replied_at: true,
      },
    });

    // Находим письма с непрочитанными сообщениями в переписке от главврача
    const lettersWithUnreadMessages = await prisma.letter.findMany({
      where: {
        patient_id: userId,
        messages: {
          some: {
            sender_type: 'chief_doctor',
            is_read: false,
          },
        },
      },
      select: {
        id: true,
        subject: true,
        messages: {
          where: {
            sender_type: 'chief_doctor',
            is_read: false,
          },
          select: {
            created_at: true,
          },
          orderBy: { created_at: 'desc' },
          take: 1,
        },
      },
    });

    // Объединяем результаты (уникальные письма)
    const allUnreadLetterIds = new Set<number>();
    const allUnreadLetters: Array<{ id: number; subject: string; replied_at: string | null; hasNewMessages?: boolean }> = [];

    // Добавляем письма с непрочитанным первым ответом
    for (const letter of lettersWithUnreadReply) {
      if (!allUnreadLetterIds.has(letter.id)) {
        allUnreadLetterIds.add(letter.id);
        allUnreadLetters.push({
          id: letter.id,
          subject: letter.subject,
          replied_at: letter.replied_at?.toISOString() || null,
        });
      }
    }

    // Добавляем письма с непрочитанными сообщениями в переписке
    for (const letter of lettersWithUnreadMessages) {
      if (!allUnreadLetterIds.has(letter.id)) {
        allUnreadLetterIds.add(letter.id);
        allUnreadLetters.push({
          id: letter.id,
          subject: letter.subject,
          replied_at: letter.messages[0]?.created_at?.toISOString() || null,
          hasNewMessages: true,
        });
      } else {
        // Если письмо уже есть, отмечаем что есть новые сообщения
        const existing = allUnreadLetters.find(l => l.id === letter.id);
        if (existing) {
          existing.hasNewMessages = true;
        }
      }
    }

    return NextResponse.json({
      count: allUnreadLetters.length,
      letters: allUnreadLetters,
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Ошибка при получении непрочитанных ответов" },
      { status: 500 }
    );
  }
}
