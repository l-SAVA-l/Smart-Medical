'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAppointmentsRealtime } from '@/hooks/useAppointmentsRealtime';
import { useSession } from 'next-auth/react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Calendar,
  Clock,
  User,
  Stethoscope,
  Eye,
  X,
  Phone,
  Mail,
} from 'lucide-react';
import { Pagination } from '@/components/common/SMPagination/SMPagination';
import { AdminMenu } from '@/components/SMAdmin/SMAdminMenu';
import {
  AdminSection,
  EmptyState,
  FormModal,
  FormField,
  FormTextarea,
  FormSelect,
} from '@/components/SMAdmin/SMAdminSection';
import NotFound from '../../not-found';
import { AdminAuthForm } from '@/components/SMAdmin/SMAdminAuthForm';
import { useAdminSession } from '@/hooks/useAdminSession';
import { AdminAccessSkeleton, AdminGridSkeleton } from '@/components/SMAdmin/SMAdminSkeleton';
import { useAlert } from '@/components/common/SMAlert';
import { useServerPagination } from '@/hooks/useServerPagination';
import {
  APPOINTMENT_STATUS_OPTIONS,
  getStatusColor,
  getStatusLabel,
} from '@/utils/appointmentStatus';

interface AppointmentRow {
  id: number;
  scheduled_at: string;
  duration_minutes: number;
  status: string;
  note: string | null;
  admin_comment: string | null;
  created_at: string;
  patient: { id: number; name: string; email: string; phone: string };
  specialist: { id: number; name: string; specialization: string };
  service: { id: number; title: string } | null;
}

const FILTER_TABS = [
  { id: 'all', label: 'Все' },
  { id: 'pending', label: 'Ожидают' },
  { id: 'confirmed', label: 'Подтверждены' },
  { id: 'cancelled', label: 'Отменены' },
  { id: 'completed', label: 'Завершены' },
  { id: 'no_show', label: 'Не явились' },
] as const;

export default function AdminAppointmentsPage() {
  const { status } = useSession();
  const { sessionVerified, isLoading: sessionLoading, verifySession } = useAdminSession();
  const [hasAdminRole, setHasAdminRole] = useState<boolean | null>(null);
  const { success, error: showError } = useAlert();
  const { currentPage, setPage, buildApiUrl } = useServerPagination(12);

  const [appointments, setAppointments] = useState<AppointmentRow[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [countsByStatus, setCountsByStatus] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('pending');
  const [viewing, setViewing] = useState<AppointmentRow | null>(null);
  const [editStatus, setEditStatus] = useState('');
  const [editComment, setEditComment] = useState('');
  const [saveLoading, setSaveLoading] = useState(false);

  useEffect(() => {
    if (status === 'authenticated') checkAdminRole();
    else if (status === 'unauthenticated') setHasAdminRole(false);
  }, [status]);

  useEffect(() => {
    if (sessionVerified && hasAdminRole) loadData();
  }, [sessionVerified, hasAdminRole, currentPage, searchQuery, filterStatus]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    setPage(1);
  }, [searchQuery, filterStatus]); // eslint-disable-line react-hooks/exhaustive-deps

  const checkAdminRole = async () => {
    try {
      const res = await fetch('/api/admin/auth');
      const data = await res.json();
      setHasAdminRole(data.isAdmin);
    } catch {
      setHasAdminRole(false);
    }
  };

  const loadData = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const apiUrl =
        buildApiUrl('/api/admin/appointments', searchQuery) +
        `&status=${filterStatus}`;
      const res = await fetch(apiUrl);
      if (res.ok) {
        const data = await res.json();
        setAppointments(data.data || []);
        setTotalPages(data.totalPages || 1);
        setTotalCount(data.totalCount || 0);
        setCountsByStatus(data.countsByStatus || {});
      } else if (!silent) {
        showError('Ошибка загрузки записей');
      }
    } catch {
      if (!silent) showError('Ошибка загрузки записей');
    } finally {
      if (!silent) setLoading(false);
    }
  }, [buildApiUrl, searchQuery, filterStatus, showError]);

  useAppointmentsRealtime({
    enabled: Boolean(sessionVerified && hasAdminRole),
    mode: 'admin',
    onUpdate: () => loadData(true),
  });

  const openView = (row: AppointmentRow) => {
    setViewing(row);
    setEditStatus(row.status);
    setEditComment(row.admin_comment || '');
  };

  const handleSave = async () => {
    if (!viewing) return;
    setSaveLoading(true);
    try {
      const res = await fetch(`/api/admin/appointments/${viewing.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: editStatus,
          admin_comment: editComment,
        }),
      });
      if (res.ok) {
        success('Запись обновлена');
        setViewing(null);
        await loadData(true);
      } else {
        const err = await res.json();
        showError(err.error || 'Ошибка сохранения');
      }
    } catch {
      showError('Ошибка сохранения');
    } finally {
      setSaveLoading(false);
    }
  };

  const formatDateTime = (iso: string) => {
    const d = new Date(iso);
    return `${d.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' })} — ${d.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}`;
  };

  if (status === 'loading' || hasAdminRole === null || sessionLoading) {
    return <AdminAccessSkeleton />;
  }
  if (status === 'unauthenticated' || !hasAdminRole) return <NotFound />;
  if (!sessionVerified) return <AdminAuthForm onSuccess={verifySession} />;

  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminMenu />
      <div className="flex-1 p-4 lg:p-8 overflow-auto">
        <div className="max-w-7xl mx-auto space-y-4">
          <div className="flex flex-wrap gap-2">
            {FILTER_TABS.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setFilterStatus(tab.id)}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all cursor-pointer ${
                  filterStatus === tab.id
                    ? 'bg-[#18A36C] text-white shadow-md'
                    : 'bg-white text-gray-600 border border-gray-200 hover:border-[#18A36C]/40'
                }`}
              >
                {tab.label}
                {tab.id !== 'all' && countsByStatus[tab.id] != null && (
                  <span className="ml-1.5 opacity-80">({countsByStatus[tab.id]})</span>
                )}
                {tab.id === 'all' && totalCount > 0 && filterStatus === 'all' && (
                  <span className="ml-1.5 opacity-80">({totalCount})</span>
                )}
              </button>
            ))}
          </div>

          <AdminSection
            title="Записи на приём"
            icon={Calendar}
            count={totalCount}
            loading={loading}
            searchValue={searchQuery}
            onSearchChange={setSearchQuery}
            loadingSkeleton={<AdminGridSkeleton count={6} />}
          >
            {appointments.length === 0 ? (
              <EmptyState icon={Calendar} title="Записей не найдено" description="Попробуйте изменить фильтр или поисковый запрос" />
            ) : (
              <div className="grid gap-4">
                {appointments.map((a) => (
                  <motion.div
                    key={a.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white border border-gray-100 rounded-xl p-4 sm:p-5 hover:shadow-md transition-shadow"
                  >
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                      <div className="space-y-2 flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${getStatusColor(a.status)}`}>
                            {getStatusLabel(a.status)}
                          </span>
                          <span className="text-xs text-gray-400">#{a.id}</span>
                        </div>
                        <p className="font-semibold text-gray-800 flex items-center gap-2">
                          <Stethoscope className="w-4 h-4 text-[#18A36C] shrink-0" />
                          {a.specialist.name} — {a.specialist.specialization}
                        </p>
                        {a.service && (
                          <p className="text-sm text-gray-600">{a.service.title}</p>
                        )}
                        <p className="text-sm text-gray-500 flex items-center gap-1">
                          <Clock className="w-4 h-4 shrink-0" />
                          {formatDateTime(a.scheduled_at)} ({a.duration_minutes} мин)
                        </p>
                        <p className="text-sm text-gray-600 flex items-center gap-1">
                          <User className="w-4 h-4 shrink-0" />
                          {a.patient.name}
                          <span className="text-gray-400">·</span>
                          {a.patient.phone}
                        </p>
                        {a.note && (
                          <p className="text-sm text-gray-500 italic border-l-2 border-gray-200 pl-2">
                            Пациент: {a.note}
                          </p>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={() => openView(a)}
                        className="flex items-center justify-center gap-2 px-4 py-2.5 bg-[#18A36C]/10 text-[#18A36C] rounded-xl hover:bg-[#18A36C]/20 transition-colors cursor-pointer shrink-0"
                      >
                        <Eye className="w-4 h-4" />
                        Управление
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </AdminSection>

          {totalPages > 1 && (
            <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setPage} />
          )}
        </div>
      </div>

      <AnimatePresence>
        {viewing && (
          <FormModal
            isOpen={!!viewing}
            onClose={() => setViewing(null)}
            title={`Запись #${viewing.id}`}
            onSubmit={handleSave}
            submitText="Сохранить"
            loading={saveLoading}
          >
            <div className="space-y-4">
              <div className="bg-gray-50 rounded-xl p-4 space-y-2 text-sm">
                <p><strong>Пациент:</strong> {viewing.patient.name}</p>
                <p className="flex items-center gap-1 text-gray-600">
                  <Mail className="w-3.5 h-3.5" /> {viewing.patient.email}
                </p>
                <p className="flex items-center gap-1 text-gray-600">
                  <Phone className="w-3.5 h-3.5" /> {viewing.patient.phone}
                </p>
                <p><strong>Врач:</strong> {viewing.specialist.name}</p>
                {viewing.service && <p><strong>Услуга:</strong> {viewing.service.title}</p>}
                <p><strong>Дата:</strong> {formatDateTime(viewing.scheduled_at)}</p>
                {viewing.note && <p><strong>Комментарий пациента:</strong> {viewing.note}</p>}
              </div>

              <FormField label="Статус" required>
                <FormSelect
                  value={editStatus}
                  onChange={(e) => setEditStatus(e.target.value)}
                >
                  {APPOINTMENT_STATUS_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </FormSelect>
              </FormField>

              <FormField label="Комментарий для пациента (виден в личном кабинете)">
                <FormTextarea
                  value={editComment}
                  onChange={(e) => setEditComment(e.target.value)}
                  rows={3}
                  placeholder="Например: возьмите с собой направление..."
                />
              </FormField>

              {editStatus !== 'cancelled' && (
                <button
                  type="button"
                  onClick={() => setEditStatus('cancelled')}
                  className="text-sm text-red-600 hover:text-red-700 flex items-center gap-1 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                  Отменить запись
                </button>
              )}
            </div>
          </FormModal>
        )}
      </AnimatePresence>
    </div>
  );
}

