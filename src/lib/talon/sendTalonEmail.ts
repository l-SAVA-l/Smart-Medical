import { prisma } from '@/lib/prisma';
import { sendEmail, EmailNotConfiguredError } from '@/lib/email/send';
import { buildTalonHtml, buildTalonPlainText } from '@/lib/talon/buildTalonHtml';
import { getClinicInfo } from '@/lib/talon/getClinicInfo';
import { validateEmail } from '@/utils/validation';

export { EmailNotConfiguredError };

export async function sendTalonEmailForAppointment(
  appointmentId: number,
  options: { to?: string; patientId?: number }
): Promise<{ sentTo: string }> {
  const appointment = await prisma.appointment.findUnique({
    where: { id: appointmentId },
    include: {
      patient: { select: { id: true, name: true, email: true } },
      specialist: { select: { name: true, specialization: true } },
      service: { select: { title: true } },
    },
  });

  if (!appointment) {
    throw new Error('Запись не найдена');
  }

  if (options.patientId != null && appointment.patient_id !== options.patientId) {
    throw new Error('Нет доступа к записи');
  }

  const to = (options.to || appointment.patient.email).trim().toLowerCase();
  const emailCheck = validateEmail(to);
  if (!emailCheck.isValid) {
    throw new Error(emailCheck.error || 'Некорректный email');
  }

  const clinic = await getClinicInfo();
  const talonData = {
    id: appointment.id,
    scheduled_at: appointment.scheduled_at,
    duration_minutes: appointment.duration_minutes,
    status: appointment.status,
    specialist: appointment.specialist,
    service: appointment.service,
    patientName: appointment.patient.name,
  };

  await sendEmail({
    to,
    subject: `Талон на приём №${appointment.id} — ${appointment.specialist.name}`,
    html: buildTalonHtml(talonData, {
      clinicName: clinic.name,
      clinicAddress: clinic.address,
    }),
    text: buildTalonPlainText(talonData),
  });

  return { sentTo: to };
}
