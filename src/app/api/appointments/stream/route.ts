import { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';
import {
  subscribeAppointmentChanges,
  type AppointmentChangeEvent,
} from '@/lib/appointmentEvents';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

function sseMessage(data: unknown): string {
  return `data: ${JSON.stringify(data)}\n\n`;
}

export async function GET(request: NextRequest) {
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });

  if (!token?.id) {
    return new Response('Unauthorized', { status: 401 });
  }

  const patientId = parseInt(token.id as string, 10);
  if (Number.isNaN(patientId)) {
    return new Response('Unauthorized', { status: 401 });
  }

  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    start(controller) {
      const send = (payload: object) => {
        controller.enqueue(encoder.encode(sseMessage(payload)));
      };

      send({ type: 'connected' });

      const onChange = (event: AppointmentChangeEvent) => {
        send({
          type: 'appointment_changed',
          appointmentId: event.appointmentId,
          action: event.action,
        });
      };

      const unsubscribe = subscribeAppointmentChanges(onChange, { patientId });

      const heartbeat = setInterval(() => {
        controller.enqueue(encoder.encode(': heartbeat\n\n'));
      }, 25000);

      request.signal.addEventListener('abort', () => {
        clearInterval(heartbeat);
        unsubscribe();
        controller.close();
      });
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
    },
  });
}
