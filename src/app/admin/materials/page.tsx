'use client';

import { useState, useEffect, useMemo } from 'react';
import { useSession } from 'next-auth/react';
import { AnimatePresence } from 'framer-motion';
import { FileText, Loader2, Calendar } from 'lucide-react';
import { Pagination } from '@/components/common/SMPagination/SMPagination';
import { ImageUploader } from '@/components/ImageUploader';
import { AdminMenu } from '@/components/SMAdmin/SMAdminMenu';
import { useServerPagination } from '@/hooks/useServerPagination';
import {
  AdminSection,
  EmptyState,
  ItemCard,
  CardActions,
  FormModal,
  FormField,
  FormInput,
  FormTextarea,
  FormDateInput,
  Badge,
} from '@/components/SMAdmin/SMAdminSection';
import NotFound from '../../not-found';
import { AdminAuthForm } from '@/components/SMAdmin/SMAdminAuthForm';
import { useAdminSession } from '@/hooks/useAdminSession';
import { AdminAccessSkeleton } from '@/components/SMAdmin/SMAdminSkeleton';
import { ImageWithFallback } from '@/components/SMImage/ImageWithFallback';
import { ConfirmDialog } from '@/components/SMAdmin/SMConfirmDialog';
import { useConfirmDialog } from '@/hooks/useConfirmDialog';
import { useAlert } from '@/components/common/SMAlert';

interface Material {
  id: number;
  title: string;
  content: string;
  detailed_content: string | null;
  image_url: string;
  date: string;
  year: number;
  is_active: boolean;
}

export default function AdminMaterialsPage() {
  const { status } = useSession();
  const { sessionVerified, isLoading: sessionLoading, verifySession } = useAdminSession();
  const [hasAdminRole, setHasAdminRole] = useState<boolean | null>(null);
  const confirmDialog = useConfirmDialog();
  const { success, error: showError } = useAlert();

  // Pagination hook
  const { currentPage, setPage, buildApiUrl } = useServerPagination(12);

  // Data states
  const [materials, setMaterials] = useState<Material[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Form states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMaterial, setEditingMaterial] = useState<Material | null>(null);
  const [formLoading, setFormLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    detailed_content: '',
    image_url: '',
    date: '',
    year: new Date().getFullYear().toString(),
    is_active: true,
  });

  // Check admin role
  useEffect(() => {
    if (status === 'authenticated') {
      checkAdminRole();
    } else if (status === 'unauthenticated') {
      setHasAdminRole(false);
    }
  }, [status]);

  // Load data when session is verified
  useEffect(() => {
    if (sessionVerified && hasAdminRole) {
      loadData();
    }
  }, [sessionVerified, hasAdminRole]);

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
      const apiUrl = buildApiUrl('/api/admin/materials', searchQuery);

      const res = await fetch(apiUrl);
      if (res.ok) {
        const response = await res.json();
        setMaterials(response.data || []);
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
      title: '',
      content: '',
      detailed_content: '',
      image_url: '',
      date: '',
      year: new Date().getFullYear().toString(),
      is_active: true,
    });
    setEditingMaterial(null);
    setIsModalOpen(false);
  };

  const handleAdd = () => {
    resetForm();
    const currentDate = new Date().toISOString().split('T')[0];
    const currentYear = new Date().getFullYear().toString();
    setFormData(prev => ({
      ...prev,
      date: currentDate,
      year: currentYear,
    }));
    setIsModalOpen(true);
  };

  const handleEdit = (material: Material) => {
    setEditingMaterial(material);
    setFormData({
      title: material.title,
      content: material.content,
      detailed_content: material.detailed_content || '',
      image_url: material.image_url,
      date: new Date(material.date).toISOString().split('T')[0],
      year: material.year.toString(),
      is_active: material.is_active,
    });
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    setFormLoading(true);
    try {
      const url = editingMaterial
        ? `/api/admin/materials/${editingMaterial.id}`
        : '/api/admin/materials';

      const method = editingMaterial ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        await loadData();
        resetForm();
        success(editingMaterial ? 'Материал обновлен' : 'Материал создан');
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

  const handleDelete = async (id: number, materialTitle: string) => {
    const confirmed = await confirmDialog.confirm({
      title: 'Удаление материала',
      message: `Вы уверены, что хотите удалить материал "${materialTitle}"? Это действие нельзя отменить.`,
      confirmText: 'Удалить',
      cancelText: 'Отмена',
      variant: 'danger',
    });

    if (!confirmed) return;

    try {
      const res = await fetch(`/api/admin/materials/${id}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        await loadData();
        success('Материал удален');
      } else {
        const error = await res.json();
        showError(error.error || 'Ошибка удаления');
      }
    } catch (error) {
      showError('Ошибка удаления');
    }
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
            title="Материалы"
            icon={FileText}
            count={totalCount}
            loading={loading}
            searchValue={searchQuery}
            onSearchChange={setSearchQuery}
            onAdd={handleAdd}
            addButtonText="Добавить материал"
          >
            {materials.length === 0 ? (
              <EmptyState
                icon={FileText}
                title="Материалы не найдены"
                description={searchQuery ? 'Попробуйте изменить поисковый запрос' : 'Добавьте первый материал'}
                actionText={!searchQuery ? 'Добавить материал' : undefined}
                onAction={!searchQuery ? handleAdd : undefined}
              />
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                  <AnimatePresence>
                    {materials.map((material) => (
                    <ItemCard key={material.id}>
                      {/* Image */}
                      <div className="w-full h-40 rounded-xl overflow-hidden bg-gray-100 mb-4">
                        <ImageWithFallback
                          src={material.image_url}
                          alt={material.title}
                          className="w-full h-full object-cover"
                        />
                      </div>

                      {/* Info */}
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant="secondary">{material.year}</Badge>
                        </div>
                        <h3 className="font-semibold text-gray-800 line-clamp-2 mb-2">{material.title}</h3>
                        <p className="text-sm text-gray-500 line-clamp-2">{material.content}</p>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
                        <span className="text-xs text-gray-400 flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {new Date(material.date).toLocaleDateString('ru-RU')}
                        </span>
                        <CardActions
                          onEdit={() => handleEdit(material)}
                          onDelete={() => handleDelete(material.id, material.title)}
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
            title={editingMaterial ? 'Редактирование материала' : 'Новый материал'}
            onSubmit={handleSave}
            loading={formLoading}
            disabled={!formData.title || !formData.content || !formData.image_url}
          >
            <div className="space-y-6">
              <FormField label="Заголовок" required>
                <FormInput
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Название материала"
                />
              </FormField>

              <FormField label="Краткое описание" required>
                <FormTextarea
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  rows={3}
                  placeholder="Краткое описание для карточки"
                />
              </FormField>

              <FormField label="Подробное описание">
                <FormTextarea
                  value={formData.detailed_content}
                  onChange={(e) => setFormData({ ...formData, detailed_content: e.target.value })}
                  rows={5}
                  placeholder="Полное описание для модального окна"
                />
              </FormField>

              <FormField label="Изображение" required>
                <ImageUploader
                  value={formData.image_url}
                  onChange={(url) => setFormData({ ...formData, image_url: url })}
                  folder="smartmedical/materials"
                  placeholder="Загрузите изображение материала"
                  maxSizeMB={10}
                />
              </FormField>

              <div className="grid grid-cols-2 gap-4">
                <FormField label="Дата" required>
                  <FormDateInput
                    value={formData.date}
                    onChange={(date) => {
                      // Автоматически извлекаем год из выбранной даты
                      const selectedYear = date ? new Date(date).getFullYear().toString() : new Date().getFullYear().toString();
                      setFormData({ ...formData, date, year: selectedYear });
                    }}
                  />
                </FormField>

                <FormField label="Год" required>
                  <FormInput
                    type="number"
                    value={formData.year}
                    onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                    placeholder="2024"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Автоматически заполняется из даты
                  </p>
                </FormField>
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, is_active: !formData.is_active })}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer ${
                    formData.is_active ? 'bg-[#18A36C]' : 'bg-gray-300'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      formData.is_active ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
                <span className="text-sm text-gray-700">
                  {formData.is_active ? 'Материал активен' : 'Материал скрыт'}
                </span>
              </div>
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
