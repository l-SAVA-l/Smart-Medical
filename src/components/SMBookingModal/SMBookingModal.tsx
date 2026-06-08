'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/common/SMDialog/SMDialog';
import { Button } from '@/components/common/SMButton/SMButton';
import { Label } from '@/components/common/SMLabel/SMLabel';
import { Input } from '@/components/common/SMInput/SMInput';
import { Textarea } from '@/components/common/SMTextarea/SMTextarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/common/SMSelect/SMSelect';
import { Loader2, Calendar, AlertCircle } from 'lucide-react';
import { useAlert } from '@/components/common/SMAlert/AlertProvider';

interface SpecialistOption {
  id: number;
  name: string;
  specialization: string;
}

interface ServiceOption {
  id: number;
  title: string;
  specialists: SpecialistOption[];
}

interface SMBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function SMBookingModal({ isOpen, onClose, onSuccess }: SMBookingModalProps) {
  const alert = useAlert();
  const [services, setServices] = useState<ServiceOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [specialistId, setSpecialistId] = useState('');
  const [serviceId, setServiceId] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [note, setNote] = useState('');
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);

  const loadServices = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/services', { credentials: 'include' });
      const data = await res.json().catch(() => []);
      const list = Array.isArray(data) ? data : [];
      setServices(
        list
          .filter((s: { id?: number }) => Number.isInteger(s?.id))
          .map((s: { id: number; title?: string; specialists?: SpecialistOption[] }) => ({
            id: s.id,
            title: s.title ?? '',
            specialists: Array.isArray(s.specialists)
              ? s.specialists.filter((sp) => Number.isInteger(sp?.id))
              : [],
          }))
      );
    } catch {
      setServices([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const selectedService = useMemo(
    () => services.find((s) => String(s.id) === serviceId),
    [services, serviceId]
  );

  const availableSpecialists = useMemo(() => {
    if (!selectedService) return [];
    return selectedService.specialists;
  }, [selectedService]);

  const selectedSpecialist = useMemo(
    () => availableSpecialists.find((s) => String(s.id) === specialistId),
    [availableSpecialists, specialistId]
  );

  const formatSpecialistLabel = (s: SpecialistOption) =>
    `${s.name} — ${s.specialization}`;

  const loadAvailability = useCallback(async (specId: string, dateStr: string) => {
    if (!specId || !dateStr) {
      setAvailableSlots([]);
      return;
    }
    setSlotsLoading(true);
    try {
      const res = await fetch(
        `/api/appointments/availability?specialistId=${specId}&date=${dateStr}`,
        { credentials: 'include' }
      );
      const data = await res.json().catch(() => ({}));
      setAvailableSlots(Array.isArray(data.availableSlots) ? data.availableSlots : []);
    } catch {
      setAvailableSlots([]);
    } finally {
      setSlotsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      loadServices();
      setSpecialistId('');
      setServiceId('');
      setDate('');
      setTime('');
      setNote('');
      setAvailableSlots([]);
    }
  }, [isOpen, loadServices]);

  useEffect(() => {
    if (specialistId && date) {
      loadAvailability(specialistId, date);
      setTime('');
    } else {
      setAvailableSlots([]);
      setTime('');
    }
  }, [specialistId, date, loadAvailability]);

  const handleServiceChange = (value: string) => {
    setServiceId(value);
    setSpecialistId('');
    setDate('');
    setTime('');
  };

  const handleSpecialistChange = (value: string) => {
    setSpecialistId(value);
    setDate('');
    setTime('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!specialistId || !serviceId || !date || !time) {
      alert.error('Заполните все обязательные поля', 'Запись');
      return;
    }
    const scheduledAt = new Date(`${date}T${time}:00`);
    if (Number.isNaN(scheduledAt.getTime())) {
      alert.error('Некорректная дата или время', 'Запись');
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch('/api/appointments', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          specialistId: parseInt(specialistId, 10),
          serviceId: parseInt(serviceId, 10),
          scheduledAt: scheduledAt.toISOString(),
          durationMinutes: 30,
          note: note.trim() || undefined,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        alert.success('Запись создана и ожидает подтверждения', 'Успех');
        onSuccess?.();
        onClose();
      } else {
        alert.error(data.error || 'Ошибка создания записи', 'Запись');
      }
    } catch {
      alert.error('Ошибка создания записи', 'Запись');
    } finally {
      setSubmitting(false);
    }
  };

  const today = new Date().toISOString().slice(0, 10);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-[calc(100%-2rem)] sm:max-w-md lg:max-w-lg max-h-[90vh] overflow-y-auto overflow-x-hidden">
        <DialogHeader>
          <DialogTitle className="text-xl text-[#2E2E2E] flex items-center gap-2">
            <Calendar className="w-5 h-5 text-[#18A36C]" />
            Запись на приём
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-5 min-w-0 w-full overflow-x-hidden">
          <div className="flex flex-col gap-3 min-w-0">
            <Label htmlFor="booking-service" className="text-gray-700 block">Услуга *</Label>
            <Select value={serviceId} onValueChange={handleServiceChange} disabled={loading}>
              <SelectTrigger
                id="booking-service"
                className="border-gray-300 min-w-0 w-full overflow-hidden [&_[data-slot=select-value]]:min-w-0 [&_[data-slot=select-value]]:truncate"
              >
                <SelectValue placeholder={loading ? 'Загрузка...' : 'Выберите услугу'} />
              </SelectTrigger>
              <SelectContent>
                {services.map((s) => (
                  <SelectItem key={s.id} value={String(s.id)}>
                    {s.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-3 min-w-0">
            <Label htmlFor="booking-specialist" className="text-gray-700 block">Врач *</Label>
            <Select
              value={specialistId}
              onValueChange={handleSpecialistChange}
              disabled={!serviceId || availableSpecialists.length === 0}
            >
              <SelectTrigger
                id="booking-specialist"
                className="border-gray-300 min-w-0 w-full overflow-hidden [&_[data-slot=select-value]]:min-w-0 [&_[data-slot=select-value]]:max-w-[calc(100%-1.5rem)] [&_[data-slot=select-value]]:truncate"
              >
                <SelectValue
                  placeholder={
                    !serviceId
                      ? 'Сначала выберите услугу'
                      : availableSpecialists.length === 0
                        ? 'Нет врачей для этой услуги'
                        : 'Выберите врача'
                  }
                >
                  {selectedSpecialist ? (
                    <span className="truncate block" title={formatSpecialistLabel(selectedSpecialist)}>
                      {formatSpecialistLabel(selectedSpecialist)}
                    </span>
                  ) : null}
                </SelectValue>
              </SelectTrigger>
              <SelectContent className="max-w-[var(--radix-select-trigger-width)]">
                {availableSpecialists.map((s) => (
                  <SelectItem
                    key={s.id}
                    value={String(s.id)}
                    title={formatSpecialistLabel(s)}
                    className="min-w-0"
                  >
                    <span className="truncate block">{formatSpecialistLabel(s)}</span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4 min-w-0">
            <div className="flex flex-col gap-3 min-w-0">
              <Label htmlFor="booking-date" className="text-gray-700 block">Дата *</Label>
              <Input
                id="booking-date"
                type="date"
                min={today}
                value={date}
                onChange={(e) => setDate(e.target.value)}
                disabled={!specialistId}
                className="border-gray-300"
              />
            </div>
            <div className="flex flex-col gap-3 min-w-0">
              <Label htmlFor="booking-time" className="text-gray-700 block">Время *</Label>
              <Select
                value={time}
                onValueChange={setTime}
                disabled={!date || slotsLoading || availableSlots.length === 0}
              >
                <SelectTrigger id="booking-time" className="border-gray-300">
                  <SelectValue
                    placeholder={
                      slotsLoading
                        ? 'Загрузка слотов...'
                        : !date
                          ? 'Выберите дату'
                          : availableSlots.length === 0
                            ? 'Нет свободных слотов'
                            : 'Выберите время'
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  {availableSlots.map((slot) => (
                    <SelectItem key={slot} value={slot}>
                      {slot}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {!slotsLoading && date && specialistId && availableSlots.length === 0 && (
            <p className="text-sm text-amber-600 flex items-center gap-1">
              <AlertCircle className="w-4 h-4 shrink-0" />
              На выбранную дату нет свободного времени
            </p>
          )}

          <div className="flex flex-col gap-3">
            <Label htmlFor="booking-note" className="text-gray-700 block">Комментарий</Label>
            <Textarea
              id="booking-note"
              placeholder="Жалобы, цель визита..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={2}
              className="border-gray-200"
            />
          </div>

          <DialogFooter className="pt-2">
            <Button type="button" variant="outline" onClick={onClose} className="border-gray-300">
              Отмена
            </Button>
            <Button
              type="submit"
              disabled={submitting || !specialistId || !serviceId || !date || !time}
              className="bg-[#18A36C] hover:bg-[#18A36C]/90 text-white"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Отправка...
                </>
              ) : (
                'Записаться'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

