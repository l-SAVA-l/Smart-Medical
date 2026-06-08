import { NextRequest } from 'next/server';
import { checkAdmin } from '@/lib/adminAuth';
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
  const adminCheck = await checkAdmin(request);
  if (!adminCheck.isAdmin) {
    return new Response(adminCheck.error || 'Forbidden', { status: 403 });
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
          patientId: event.patientId,
          action: event.action,
        });
      };

      const unsubscribe = subscribeAppointmentChanges(onChange);

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
