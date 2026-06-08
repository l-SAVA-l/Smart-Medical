import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import {
  sendTalonEmailForAppointment,
  EmailNotConfiguredError,
} from '@/lib/talon/sendTalonEmail';
import { isEmailConfigured } from '@/lib/email/config';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    if (!isEmailConfigured()) {
      return NextResponse.json(
        { error: 'Почта не настроена. Обратитесь к администратору.' },
        { status: 503 }
      );
    }

    const token = await getToken({
      req: request,
      secret: process.env.NEXTAUTH_SECRET,
    });
    if (!token?.id) {
      return NextResponse.json({ error: 'Войдите в аккаунт' }, { status: 401 });
    }

    const patientId = parseInt(token.id as string, 10);
    const { id } = await params;
    const appointmentId = parseInt(id, 10);
    if (Number.isNaN(appointmentId)) {
      return NextResponse.json({ error: 'Неверный идентификатор записи' }, { status: 400 });
    }

    const body = await request.json().catch(() => ({}));
    const to = typeof body.email === 'string' ? body.email : undefined;

    const result = await sendTalonEmailForAppointment(appointmentId, {
      patientId,
      to,
    });

    return NextResponse.json(
      { ok: true, sentTo: result.sentTo, message: 'Талон отправлен на почту' },
      { status: 200 }
    );
  } catch (error) {
    if (error instanceof EmailNotConfiguredError) {
      return NextResponse.json({ error: error.message }, { status: 503 });
    }
    const message = error instanceof Error ? error.message : 'Ошибка отправки';
    const status =
      message === 'Запись не найдена'
        ? 404
        : message === 'Нет доступа к записи'
          ? 403
          : 400;
    console.error('Send talon error:', error);
    return NextResponse.json({ error: message }, { status });
  }
}
