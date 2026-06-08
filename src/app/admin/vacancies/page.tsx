'use client';

import { useState, useEffect, useMemo } from 'react';
import { useSession } from 'next-auth/react';
import { AnimatePresence } from 'framer-motion';
import { Briefcase, Loader2, Clock } from 'lucide-react';
import { AdminMenu } from '@/components/SMAdmin/SMAdminMenu';
import { Pagination } from '@/components/common/SMPagination/SMPagination';
import {
  AdminSection,
  EmptyState,
  ItemCard,
  CardActions,
  FormModal,
  FormField,
  FormInput,
  FormTextarea,
  Badge,
} from '@/components/SMAdmin/SMAdminSection';
import NotFound from '../../not-found';
import { AdminAuthForm } from '@/components/SMAdmin/SMAdminAuthForm';
import { useAdminSession } from '@/hooks/useAdminSession';
import { AdminAccessSkeleton } from '@/components/SMAdmin/SMAdminSkeleton';
import { ConfirmDialog } from '@/components/SMAdmin/SMConfirmDialog';
import { useConfirmDialog } from '@/hooks/useConfirmDialog';
import { useAlert } from '@/components/common/SMAlert';
import { useServerPagination } from '@/hooks/useServerPagination';

interface Vacancy {
  id: number;
  name: string;
  category: string;
  description: string;
  payment: number;
  experience: number;
  requirements: string;
}

export default function AdminVacanciesPage() {
  const { status } = useSession();
  const { sessionVerified, isLoading: sessionLoading, verifySession } = useAdminSession();
  const [hasAdminRole, setHasAdminRole] = useState<boolean | null>(null);
  const confirmDialog = useConfirmDialog();
  const { success, error: showError } = useAlert();

  // Pagination hook
  const { currentPage, setPage, buildApiUrl } = useServerPagination(12);

  // Data states
  const [vacancies, setVacancies] = useState<Vacancy[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Form states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingVacancy, setEditingVacancy] = useState<Vacancy | null>(null);
  const [formLoading, setFormLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    description: '',
    payment: '',
    experience: '0',
    requirements: '',
  });

  // Check admin role
  useEffect(() => {
    if (status === 'authenticated') {
      checkAdminRole();
    } else if (status === 'unauthenticated') {
      setHasAdminRole(false);
    }
  }, [status]);

  const checkAdminRole = async () => {
    try {
      const res = await fetch('/api/admin/auth');
      const data = await res.json();
      setHasAdminRole(data.isAdmin);
    } catch (error) {
      setHasAdminRole(false);
    }
  };

  const handleAuthSuccess = () => {
    verifySession();
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const apiUrl = buildApiUrl('/api/admin/vacancies', searchQuery);

      const res = await fetch(apiUrl);
      if (res.ok) {
        const response = await res.json();
        setVacancies(response.data || []);
        setTotalPages(response.totalPages || 1);
        setTotalCount(response.totalCount || 0);
      }
    } catch (error) {
      showError('Ошибка загрузки данных');
    } finally {
      setLoading(false);
    }
  };

  // Load data when session is verified or page/search changes
  useEffect(() => {
    if (sessionVerified && hasAdminRole) {
      loadData();
    }
  }, [sessionVerified, hasAdminRole, currentPage, searchQuery]); // eslint-disable-line react-hooks/exhaustive-deps

  // Reset page when search changes
  useEffect(() => {
    setPage(1);
  }, [searchQuery]); // eslint-disable-line react-hooks/exhaustive-deps

  // Form handlers
  const resetForm = () => {
    setFormData({
      name: '',
      category: '',
      description: '',
      payment: '',
      experience: '0',
      requirements: '',
    });
    setEditingVacancy(null);
    setIsModalOpen(false);
  };

  const handleAdd = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const handleEdit = (vacancy: Vacancy) => {
    setEditingVacancy(vacancy);
    setFormData({
      name: vacancy.name,
      category: vacancy.category,
      description: vacancy.description,
      payment: vacancy.payment.toString(),
      experience: vacancy.experience.toString(),
      requirements: vacancy.requirements,
    });
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    setFormLoading(true);
    try {
      const url = editingVacancy
        ? `/api/admin/vacancies/${editingVacancy.id}`
        : '/api/admin/vacancies';

      const method = editingVacancy ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        await loadData();
        resetForm();
        success(editingVacancy ? 'Вакансия обновлена' : 'Вакансия создана');
      } else {
        const error = await res.json();
        showError(error.error || 'Ошибка сохранения');
      }
    } catch (error) {
      showError('Ошибка сохранения');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async (id: number, vacancyName: string) => {
    const confirmed = await confirmDialog.confirm({
      title: 'Удаление вакансии',
      message: `Вы уверены, что хотите удалить вакансию "${vacancyName}"? Это действие нельзя отменить.`,
      confirmText: 'Удалить',
      cancelText: 'Отмена',
      variant: 'danger',
    });

    if (!confirmed) return;

    try {
      const res = await fetch(`/api/admin/vacancies/${id}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        await loadData();
        success('Вакансия удалена');
      } else {
        const error = await res.json();
        showError(error.error || 'Ошибка удаления');
      }
    } catch (error) {
      showError('Ошибка удаления');
    }
  };

  // Format salary
  const formatSalary = (payment: number) => {
    return new Intl.NumberFormat('ru-RU').format(payment) + ' BYN';
  };

  // Loading state
  if (status === 'loading' || hasAdminRole === null || sessionLoading) {
    return <AdminAccessSkeleton />;
  }

  // Not admin - show 404
  if (status === 'unauthenticated' || !hasAdminRole) {
    return <NotFound />;
  }

  // Admin login form (only if session not verified)
  if (!sessionVerified) {
    return <AdminAuthForm onSuccess={handleAuthSuccess} />;
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminMenu />

      <div className="flex-1 p-4 lg:p-8 overflow-auto">
        <div className="max-w-7xl mx-auto">
          <AdminSection
            title="Вакансии"
            icon={Briefcase}
            count={totalCount}
            loading={loading}
            searchValue={searchQuery}
            onSearchChange={setSearchQuery}
            onAdd={handleAdd}
            addButtonText="Добавить вакансию"
          >
            {vacancies.length === 0 ? (
              <EmptyState
                icon={Briefcase}
                title="Вакансии не найдены"
                description={searchQuery ? 'Попробуйте изменить поисковый запрос' : 'Добавьте первую вакансию'}
                actionText={!searchQuery ? 'Добавить вакансию' : undefined}
                onAction={!searchQuery ? handleAdd : undefined}
              />
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                  <AnimatePresence>
                    {vacancies.map((vacancy) => (
                      <ItemCard key={vacancy.id}>
                        {/* Header */}
                        <div className="flex items-start justify-between gap-4 mb-3">
                          <div>
                            <h3 className="font-semibold text-gray-800">{vacancy.name}</h3>
                            <Badge variant="primary" >{vacancy.category}</Badge>
                          </div>
                          <div className="text-right">
                            <div className="text-lg font-bold text-[#18A36C]">
                              {formatSalary(vacancy.payment)}
                            </div>
                          </div>
                        </div>

                        {/* Description */}
                        <p className="text-sm text-gray-500 line-clamp-2 mb-3">
                          {vacancy.description}
                        </p>

                        {/* Info */}
                        <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
                          <span className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            {vacancy.experience > 0 ? `от ${vacancy.experience} лет` : 'Без опыта'}
                          </span>
                        </div>

                        {/* Requirements preview */}
                        <div className="text-xs text-gray-400 bg-gray-50 rounded-lg p-3 line-clamp-2">
                          {vacancy.requirements}
                        </div>

                        {/* Actions */}
                        <div className="flex items-center justify-end mt-4 pt-4 border-t border-gray-100">
                          <CardActions
                            onEdit={() => handleEdit(vacancy)}
                            onDelete={() => handleDelete(vacancy.id, vacancy.name)}
                          />
                        </div>
                      </ItemCard>
                    ))}
                  </AnimatePresence>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={setPage}
                    className="mt-6"
                  />
                )}
              </>
            )}
          </AdminSection>

          {/* Form Modal */}
          <FormModal
            isOpen={isModalOpen}
            onClose={resetForm}
            title={editingVacancy ? 'Редактирование вакансии' : 'Новая вакансия'}
            onSubmit={handleSave}
            loading={formLoading}
            disabled={!formData.name || !formData.category || !formData.payment}
          >
            <div className="space-y-6">
              <FormField label="Название должности" required>
                <FormInput
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Стоматолог-терапевт"
                />
              </FormField>

              <FormField label="Категория" required>
                <FormInput
                  type="text"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  placeholder="Медицина"
                />
              </FormField>

              <FormField label="Описание" required>
                <FormTextarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={4}
                  placeholder="Описание вакансии и обязанностей"
                />
              </FormField>

              <div className="grid grid-cols-2 gap-4">
                <FormField label="Зарплата (BYN)" required>
                  <FormInput
                    type="number"
                    value={formData.payment}
                    onChange={(e) => setFormData({ ...formData, payment: e.target.value })}
                    placeholder="100000"
                  />
                </FormField>

                <FormField label="Опыт (лет)">
                  <FormInput
                    type="number"
                    min="0"
                    value={formData.experience}
                    onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
                    placeholder="0"
                  />
                </FormField>
              </div>

              <FormField label="Требования">
                <FormTextarea
                  value={formData.requirements}
                  onChange={(e) => setFormData({ ...formData, requirements: e.target.value })}
                  rows={4}
                  placeholder="Требования к кандидату"
                />
              </FormField>
            </div>
          </FormModal>

          {/* Confirm Dialog */}
          <ConfirmDialog
            isOpen={confirmDialog.isOpen}
            onClose={confirmDialog.handleCancel}
            onConfirm={confirmDialog.handleConfirm}
            title={confirmDialog.options.title}
            message={confirmDialog.options.message}
            confirmText={confirmDialog.options.confirmText}
            cancelText={confirmDialog.options.cancelText}
            variant={confirmDialog.options.variant}
            loading={confirmDialog.loading}
          />
        </div>
      </div>
    </div>
  );
}
