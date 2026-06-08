import nodemailer from 'nodemailer';
import { getMailConfig, isEmailConfigured } from './config';

export class EmailNotConfiguredError extends Error {
  constructor() {
    super('Почтовый сервер не настроен. Добавьте SMTP_* в .env');
    this.name = 'EmailNotConfiguredError';
  }
}

export interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

let transporter: nodemailer.Transporter | null = null;

function getTransporter() {
  const config = getMailConfig();
  if (!config) {
    throw new EmailNotConfiguredError();
  }
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: config.host,
      port: config.port,
      secure: config.secure,
      auth: { user: config.user, pass: config.pass },
    });
  }
  return { transporter, from: config.from };
}

export async function sendEmail(options: SendEmailOptions): Promise<void> {
  const { transporter: tx, from } = getTransporter();
  await tx.sendMail({
    from,
    to: options.to,
    subject: options.subject,
    html: options.html,
    text: options.text,
  });
}

export { isEmailConfigured };
