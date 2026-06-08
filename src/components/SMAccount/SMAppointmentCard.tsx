'use client';

import { useState } from 'react';
import {
  Calendar,
  Clock,
  Download,
  FileText,
  Mail,
  MessageSquare,
  Loader2,
  Stethoscope,
  XCircle,
  Check,
} from 'lucide-react';
import { Button } from '@/components/common/SMButton/SMButton';
import { Input } from '@/components/common/SMInput/SMInput';
import { Label } from '@/components/common/SMLabel/SMLabel';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/common/SMDialog/SMDialog';
import {
  getStatusAccent,
  getStatusCardTint,
  getStatusColor,
  getStatusLabel,
  canPatientCancel,
} from '@/utils/appointmentStatus';
import { validateEmail } from '@/utils/validation';

export interface AppointmentCardData {
  id: number;
  scheduled_at: string;
  duration_minutes: number;
  status: string;
  note: string | null;
  admin_comment: string | null;
  specialist: { id: number; name: string; specialization: string };
  service: { id: number; title: string } | null;
}

type EmailTarget = 'account' | 'custom';

interface SMAppointmentCardProps {
  appointment: AppointmentCardData;
  onCancel: (id: number) => Promise<void>;
  onDownloadTalon: (appointment: AppointmentCardData) => void;
  onSendTalonEmail?: (id: number, email: string) => Promise<void>;
  accountEmail?: string | null;
  cancelling?: boolean;
  sendingEmail?: boolean;
  emailEnabled?: boolean;
}

function formatDateTime(iso: string) {
  const d = new Date(iso);
  return {
    date: d.toLocaleDateString('ru-RU', {
      weekday: 'short',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }),
    time: d.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' }),
  };
}

export function SMAppointmentCard({
  appointment: a,
  onCancel,
  onDownloadTalon,
  onSendTalonEmail,
  accountEmail = '',
  cancelling = false,
  sendingEmail = false,
  emailEnabled = true,
}: SMAppointmentCardProps) {
  const { date, time } = formatDateTime(a.scheduled_at);
  const canCancel = canPatientCancel(a.status);

  const [talonDialogOpen, setTalonDialogOpen] = useState(false);
  const [emailTarget, setEmailTarget] = useState<EmailTarget>('account');
  const [customEmail, setCustomEmail] = useState('');
  const [emailError, setEmailError] = useState('');

  const hasAccountEmail = Boolean(accountEmail?.trim());

  const resetEmailForm = () => {
    setEmailTarget(hasAccountEmail ? 'account' : 'custom');
    setCustomEmail('');
    setEmailError('');
  };

  const handleDialogOpenChange = (open: boolean) => {
    setTalonDialogOpen(open);
    if (open) {
      resetEmailForm();
    }
  };

  const resolveEmail = (): string => {
    if (emailTarget === 'account' && hasAccountEmail) {
      return accountEmail!.trim();
    }
    return customEmail.trim();
  };

  const handleSendEmail = async () => {
    const email = resolveEmail();
    const check = validateEmail(email);
    if (!check.isValid) {
      setEmailError(check.error || 'Некорректный email');
      return;
    }
    setEmailError('');
    await onSendTalonEmail?.(a.id, email);
  };

  return (
    <article
      className={`rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden border-l-4 ${getStatusAccent(a.status)} ${getStatusCardTint(a.status)}`}
    >
      <div className="p-4 sm:p-5">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
          <span
            className={`inline-flex items-center text-xs font-semibold px-3 py-1 rounded-full ${getStatusColor(a.status)}`}
          >
            {getStatusLabel(a.status)}
          </span>
          <span className="text-xs text-gray-400 font-medium">№{a.id}</span>
        </div>

        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
          <div className="flex-1 min-w-0 space-y-3">
            <div>
              <p className="font-semibold text-gray-800 text-base sm:text-lg flex items-start gap-2">
                <Stethoscope className="w-5 h-5 text-[#18A36C] shrink-0 mt-0.5" />
                <span className="min-w-0 break-words">{a.specialist.name}</span>
              </p>
              <p className="text-sm text-gray-600 mt-1 ml-7">{a.specialist.specialization}</p>
            </div>

            {a.service && (
              <p className="text-sm text-[#18A36C] font-medium ml-7 bg-[#18A36C]/10 inline-block px-2.5 py-0.5 rounded-lg max-w-full truncate">
                {a.service.title}
              </p>
            )}

            <div className="flex items-start gap-2 ml-7 bg-white/70 border border-gray-100 rounded-lg px-3 py-2.5">
              <Clock className="w-4 h-4 text-[#18A36C] shrink-0 mt-0.5" />
              <div className="text-sm text-gray-700 min-w-0">
                <span className="font-medium capitalize">{date}</span>
                <span className="text-gray-500"> — </span>
                <span className="font-medium">{time}</span>
                {a.duration_minutes ? (
                  <span className="text-gray-400"> ({a.duration_minutes} мин)</span>
                ) : null}
              </div>
            </div>

            {a.note && (
              <p className="text-sm text-gray-600 ml-7 border-l-2 border-gray-200 pl-3">
                <span className="text-gray-400 block text-xs mb-0.5">Ваш комментарий</span>
                {a.note}
              </p>
            )}

            {a.admin_comment && (
              <div className="ml-0 sm:ml-7 flex gap-2 bg-[#18A36C]/10 border border-[#18A36C]/20 rounded-xl p-3 sm:p-4">
                <MessageSquare className="w-4 h-4 text-[#18A36C] shrink-0 mt-0.5" />
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-[#18A36C] mb-1">Сообщение от клиники</p>
                  <p className="text-sm text-gray-700 break-words">{a.admin_comment}</p>
                </div>
              </div>
            )}
          </div>

          <div className="flex flex-col sm:flex-row md:flex-col gap-2 w-full md:w-auto md:min-w-[168px] shrink-0 pt-3 mt-1 border-t border-gray-200/60 md:border-t-0 md:pt-0 md:mt-0">
            {canCancel && (
              <Button
                variant="outline"
                size="sm"
                disabled={cancelling}
                className="w-full justify-center text-red-600 border-red-200 bg-white hover:bg-red-50 hover:border-red-300 rounded-xl h-10"
                onClick={() => onCancel(a.id)}
              >
                <XCircle className="w-4 h-4 mr-2 shrink-0" />
                Отменить
              </Button>
            )}

            <Dialog open={talonDialogOpen} onOpenChange={handleDialogOpenChange}>
              <DialogTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full justify-center text-[#18A36C] border-[#18A36C]/40 bg-white hover:bg-[#18A36C]/10 rounded-xl h-10"
                >
                  <FileText className="w-4 h-4 mr-2 shrink-0" />
                  Талон
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-[#18A36C]" />
                    Талон на приём
                  </DialogTitle>
                  <DialogDescription>{a.specialist.name}</DialogDescription>
                </DialogHeader>

                <Button
                  variant="outline"
                  onClick={() => onDownloadTalon(a)}
                  className="w-full rounded-xl"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Скачать PDF
                </Button>

                {emailEnabled && onSendTalonEmail ? (
                  <div className="space-y-3 pt-2 border-t border-gray-100">
                    <p className="text-sm font-medium text-gray-800 flex items-center gap-2">
                      <Mail className="w-4 h-4 text-[#18A36C]" />
                      Отправить на почту
                    </p>

                    {hasAccountEmail && (
                      <button
                        type="button"
                        onClick={() => {
                          setEmailTarget('account');
                          setEmailError('');
                        }}
                        className={`w-full text-left rounded-xl border-2 p-3 transition-colors ${
                          emailTarget === 'account'
                            ? 'border-[#18A36C] bg-[#18A36C]/5'
                            : 'border-gray-200 hover:border-[#18A36C]/40'
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <span
                            className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 ${
                              emailTarget === 'account'
                                ? 'border-[#18A36C] bg-[#18A36C] text-white'
                                : 'border-gray-300'
                            }`}
                          >
                            {emailTarget === 'account' ? <Check className="w-3 h-3" /> : null}
                          </span>
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-gray-800">Почта аккаунта</p>
                            <p className="text-sm text-gray-600 truncate">{accountEmail}</p>
                          </div>
                        </div>
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => {
                        setEmailTarget('custom');
                        setEmailError('');
                      }}
                      className={`w-full text-left rounded-xl border-2 p-3 transition-colors ${
                        emailTarget === 'custom'
                          ? 'border-[#18A36C] bg-[#18A36C]/5'
                          : 'border-gray-200 hover:border-[#18A36C]/40'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <span
                          className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 ${
                            emailTarget === 'custom'
                              ? 'border-[#18A36C] bg-[#18A36C] text-white'
                              : 'border-gray-300'
                          }`}
                        >
                          {emailTarget === 'custom' ? <Check className="w-3 h-3" /> : null}
                        </span>
                        <p className="text-sm font-medium text-gray-800">Другой адрес</p>
                      </div>
                    </button>

                    {emailTarget === 'custom' && (
                      <div className="space-y-1.5 pl-1">
                        <Label htmlFor={`talon-email-${a.id}`} className="text-gray-600 text-xs">
                          Email для получения талона
                        </Label>
                        <Input
                          id={`talon-email-${a.id}`}
                          type="email"
                          placeholder="example@mail.com"
                          value={customEmail}
                          onChange={(e) => {
                            setCustomEmail(e.target.value);
                            setEmailError('');
                          }}
                          className="rounded-xl"
                          autoComplete="email"
                        />
                      </div>
                    )}

                    {emailError && (
                      <p className="text-sm text-red-600">{emailError}</p>
                    )}

                    <Button
                      className="w-full rounded-xl bg-[#18A36C] hover:bg-[#18A36C]/90 text-white"
                      disabled={sendingEmail}
                      onClick={handleSendEmail}
                    >
                      {sendingEmail ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <Mail className="w-4 h-4 mr-2" />
                      )}
                      Отправить талон
                    </Button>
                  </div>
                ) : (
                  <p className="text-sm text-gray-500 pt-2 border-t border-gray-100">
                    Отправка на почту временно недоступна
                  </p>
                )}

              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>
    </article>
  );
}
