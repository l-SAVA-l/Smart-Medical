import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getToken } from "next-auth/jwt";

// GET - Проверить, есть ли непрочитанные сообщения у пациента
export async function GET(request: NextRequest) {
  try {
    const token = await getToken({
      req: request,
      secret: process.env.NEXTAUTH_SECRET
    });

    if (!token || !token.id) {
      return NextResponse.json(
        { hasUnread: false },
        {
          headers: {
            'Cache-Control': 'no-store, no-cache, must-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0',
          }
        }
      );
    }

    const userId = parseInt(token.id as string);

    // Ищем активный чат пользователя с непрочитанными сообщениями
    const chat = await prisma.operatorChat.findFirst({
      where: {
        patient_id: userId,
        status: { in: ['WAITING', 'ACTIVE'] },
        has_unread_patient: true,
      },
      select: { id: true },
    });

    return NextResponse.json(
      { hasUnread: !!chat },
      {
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0',
        }
      }
    );
  } catch (error) {
    return NextResponse.json(
      { hasUnread: false },
      {
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0',
        }
      }
    );
  }
}
