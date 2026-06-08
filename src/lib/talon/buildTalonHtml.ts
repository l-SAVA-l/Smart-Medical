import { getStatusLabel } from '@/utils/appointmentStatus';

export interface TalonAppointmentData {
  id: number;
  scheduled_at: Date | string;
  duration_minutes: number;
  status: string;
  specialist: { name: string; specialization: string };
  service: { title: string } | null;
  patientName?: string;
}

function formatDateTime(scheduledAt: Date | string) {
  const d = new Date(scheduledAt);
  return {
    date: d.toLocaleDateString('ru-RU', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }),
    time: d.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' }),
  };
}

export function buildTalonHtml(
  appointment: TalonAppointmentData,
  options?: { clinicAddress?: string; clinicName?: string }
): string {
  const { date, time } = formatDateTime(appointment.scheduled_at);
  const clinicName = options?.clinicName || 'SmartMedical';
  const address = options?.clinicAddress || '';
  const statusLabel = getStatusLabel(appointment.status);

  return `<!DOCTYPE html>
<html lang="ru">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:24px;background:#f4f6f5;font-family:Arial,sans-serif;">
  <div style="max-width:480px;margin:0 auto;background:#fff;border:2px solid #18A36C;border-radius:12px;overflow:hidden;">
    <div style="background:linear-gradient(135deg,#18A36C 0%,#14965f 100%);padding:24px;text-align:center;">
      <h1 style="margin:0;color:#fff;font-size:22px;">Талон на приём</h1>
      <p style="margin:8px 0 0;color:rgba(255,255,255,0.9);font-size:14px;">${clinicName}</p>
    </div>
    <div style="padding:24px;">
      <p style="margin:0 0 16px;color:#666;font-size:13px;">Запись №${appointment.id}</p>
      <span style="display:inline-block;padding:4px 12px;background:#e8f5ef;color:#18A36C;border-radius:20px;font-size:12px;font-weight:600;margin-bottom:20px;">${statusLabel}</span>
      ${appointment.patientName ? `<p style="margin:0 0 12px;color:#333;"><strong>Пациент:</strong> ${appointment.patientName}</p>` : ''}
      <div style="margin-bottom:16px;padding:12px;background:#f9fafb;border-radius:8px;">
        <p style="margin:0 0 4px;color:#888;font-size:11px;text-transform:uppercase;">Специалист</p>
        <p style="margin:0;font-size:17px;font-weight:bold;color:#222;">${appointment.specialist.name}</p>
        <p style="margin:4px 0 0;color:#555;font-size:14px;">${appointment.specialist.specialization}</p>
      </div>
      <div style="margin-bottom:16px;padding:12px;background:#f0faf5;border-radius:8px;border-left:3px solid #18A36C;">
        <p style="margin:0 0 4px;color:#888;font-size:11px;text-transform:uppercase;">Услуга</p>
        <p style="margin:0;font-size:15px;color:#333;">${appointment.service?.title || 'Консультация'}</p>
      </div>
      <table style="width:100%;border-collapse:collapse;margin-top:8px;">
        <tr>
          <td style="padding:8px 0;border-top:1px solid #eee;">
            <span style="color:#888;font-size:11px;text-transform:uppercase;">Дата</span><br/>
            <strong style="font-size:15px;color:#222;">${date}</strong>
          </td>
          <td style="padding:8px 0;border-top:1px solid #eee;text-align:right;">
            <span style="color:#888;font-size:11px;text-transform:uppercase;">Время</span><br/>
            <strong style="font-size:15px;color:#222;">${time}</strong>
            ${appointment.duration_minutes ? `<br/><span style="color:#999;font-size:12px;">${appointment.duration_minutes} мин</span>` : ''}
          </td>
        </tr>
      </table>
      ${address ? `<p style="margin:20px 0 0;color:#666;font-size:13px;text-align:center;">📍 ${address}</p>` : ''}
      <p style="margin:24px 0 0;color:#999;font-size:12px;text-align:center;line-height:1.5;">
        Предъявите талон при посещении.<br/>Приходите за 10 минут до начала приёма.
      </p>
    </div>
  </div>
</body>
</html>`;
}

export function buildTalonPlainText(appointment: TalonAppointmentData): string {
  const { date, time } = formatDateTime(appointment.scheduled_at);
  return [
    'Талон на приём',
    `Запись №${appointment.id}`,
    `Статус: ${getStatusLabel(appointment.status)}`,
    appointment.patientName ? `Пациент: ${appointment.patientName}` : '',
    `Специалист: ${appointment.specialist.name} (${appointment.specialist.specialization})`,
    `Услуга: ${appointment.service?.title || 'Консультация'}`,
    `Дата: ${date}, время: ${time}`,
    'Приходите за 10 минут до начала приёма.',
  ]
    .filter(Boolean)
    .join('\n');
}
