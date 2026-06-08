'use client';

import { useState, useEffect, useMemo } from 'react';
import { useSession } from 'next-auth/react';
import { AnimatePresence } from 'framer-motion';
import { ShoppingBag, Loader2 } from 'lucide-react';
import { Pagination } from '@/components/common/SMPagination/SMPagination';
import { ImageUploader } from '@/components/ImageUploader';
import { MultiImageUploader } from '@/components/ImageUploader/MultiImageUploader';
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
  FormSelect,
  Badge,
} from '@/components/SMAdmin/SMAdminSection';
import NotFound from '../../not-found';
import { AdminAuthForm } from '@/components/SMAdmin/SMAdminAuthForm';
import { useAdminSession } from '@/hooks/useAdminSession';
import { useAlert } from '@/components/common/SMAlert/AlertProvider';
import { AdminAccessSkeleton } from '@/components/SMAdmin/SMAdminSkeleton';
import { ImageWithFallback } from '@/components/SMImage/ImageWithFallback';
import { ConfirmDialog } from '@/components/SMAdmin/SMConfirmDialog';
import { useConfirmDialog } from '@/hooks/useConfirmDialog';
import { CategoryListSelector } from '@/components/common/SMCategoryListSelector/SMCategoryListSelector';

interface Service {
  id: number;
  title: string;
  subtitle: string;
  price: number;
  video_url: string;
  description: string;
  image_url: string;
  image_url_1: string;
  image_url_2: string;
  image_url_3: string;
  image_url_4: string | null;
  category_id?: number; // Опциональная для обратной совместимости
  service_category_id: number | null;
  category?: {
    id: number;
    name: string;
    slug: string;
  };
  serviceCategory?: {
    id: number;
    name: string;
    slug: string;
  };
  specialists: {
    id: number;
    name: string;
  }[];
}

interface Specialist {
  id: number;
  name: string;
}

interface ServiceCategory {
  id: number;
  name: string;
  slug: string;
  parent_id: number | null;
  children?: ServiceCategory[];
}

export default function AdminServicesPage() {
  const { status } = useSession();
  const { sessionVerified, isLoading: sessionLoading, verifySession } = useAdminSession();
  const [hasAdminRole, setHasAdminRole] = useState<boolean | null>(null);
  const [isCheckingRole, setIsCheckingRole] = useState(true);
  const { success, error: showError } = useAlert();
  const confirmDialog = useConfirmDialog();

  // Pagination hook
  const { currentPage, setPage, buildApiUrl } = useServerPagination(12);

  // Data states
  const [services, setServices] = useState<Service[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [serviceCategories, setServiceCategories] = useState<ServiceCategory[]>([]);
  const [specialists, setSpecialists] = useState<Specialist[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Form states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [formLoading, setFormLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    subtitle: '',
    price: '',
    video_url: '',
    description: '',
    image_url: '',
    image_url_1: '',
    image_url_2: '',
    image_url_3: '',
    image_url_4: '',
    specialist_ids: [] as string[],
    service_category_id: '',
  });

  // Check admin role
  useEffect(() => {
    if (status === 'authenticated') {
      checkAdminRole();
    } else if (status === 'unauthenticated') {
      setHasAdminRole(false);
    }
  }, [status]);

  // Load data when session is verified or page/search changes
  useEffect(() => {
    if (sessionVerified && hasAdminRole) {
      loadData();
    }
  }, [sessionVerified, hasAdminRole, currentPage, searchQuery]); // eslint-disable-line react-hooks/exhaustive-deps

  const checkAdminRole = async () => {
    setIsCheckingRole(true);
    try {
      const res = await fetch('/api/admin/auth');
      const data = await res.json();
      setHasAdminRole(data.isAdmin);
    } catch (error) {
      setHasAdminRole(false);
    } finally {
      setIsCheckingRole(false);
    }
  };

  const handleAuthSuccess = () => {
    verifySession();
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const apiUrl = buildApiUrl('/api/admin/services', searchQuery);

      const [servicesRes, serviceCategoriesRes, specialistsRes] = await Promise.all([
        fetch(apiUrl),
        fetch('/api/admin/service-categories'),
        fetch('/api/specialists'),
      ]);

      if (servicesRes.ok) {
        const response = await servicesRes.json();
        setServices(response.data || []);
        setTotalPages(response.totalPages || 1);
        setTotalCount(response.totalCount || 0);
      }

      if (serviceCategoriesRes.ok) {
        const data = await serviceCategoriesRes.json();
        setServiceCategories(data);
      }

      if (specialistsRes.ok) {
        const data = await specialistsRes.json();
        setSpecialists(data);
      }
    } catch (error) {
      showError('Ошибка загрузки данных');
    } finally {
      setLoading(false);
    }
  };

  // Reset page when search changes
  useEffect(() => {
    setPage(1);
  }, [searchQuery]); // eslint-disable-line react-hooks/exhaustive-deps

  // Flatten service categories (теперь без подкатегорий, все корневые)
  const flattenedServiceCategories = useMemo(() => {
    // Можно выбирать любую категорию, так как подкатегорий больше нет
    return serviceCategories.map(cat => ({
      ...cat,
      level: 0,
      disabled: false,
    }));
  }, [serviceCategories]);

  // Form handlers
  const resetForm = () => {
    setFormData({
      title: '',
      subtitle: '',
      price: '',
      video_url: '',
      description: '',
      image_url: '',
      image_url_1: '',
      image_url_2: '',
      image_url_3: '',
      image_url_4: '',
      specialist_ids: [],
      service_category_id: '',
    });
    setEditingService(null);
    setIsModalOpen(false);
  };

  const handleAdd = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const handleEdit = (service: Service) => {
    setEditingService(service);
    setFormData({
      title: service.title,
      subtitle: service.subtitle,
      price: service.price.toString(),
      video_url: service.video_url,
      description: service.description,
      image_url: service.image_url,
      image_url_1: service.image_url_1,
      image_url_2: service.image_url_2,
      image_url_3: service.image_url_3,
      image_url_4: service.image_url_4 || '',
      specialist_ids: service.specialists.map(s => s.id.toString()),
      service_category_id: service.service_category_id?.toString() || '',
    });
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    setFormLoading(true);
    try {
      const url = editingService
        ? `/api/admin/services/${editingService.id}`
        : '/api/admin/services';

      const method = editingService ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        await loadData();
        resetForm();
        success(editingService ? 'Услуга обновлена' : 'Услуга создана');
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

  const handleDelete = async (id: number, serviceName: string) => {
    const confirmed = await confirmDialog.confirm({
      title: 'Удаление услуги',
      message: `Вы уверены, что хотите удалить услугу "${serviceName}"? Это действие нельзя отменить.`,
      confirmText: 'Удалить',
      cancelText: 'Отмена',
      variant: 'danger',
    });

    if (!confirmed) return;

    try {
      const res = await fetch(`/api/admin/services/${id}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        await loadData();
        success('Услуга удалена');
      } else {
        const error = await res.json();
        showError(error.error || 'Ошибка удаления');
      }
    } catch (error) {
      showError('Ошибка удаления');
    }
  };

  // Loading state
  if (status === 'loading' || hasAdminRole === null || sessionLoading || isCheckingRole) {
    return <AdminAccessSkeleton />;
  }

  // Not admin - show 404 (только после завершения проверки)
  if (status === 'unauthenticated' || hasAdminRole === false) {
    return <NotFound />;
  }

  // Admin login form
  if (!sessionVerified) {
    return <AdminAuthForm onSuccess={handleAuthSuccess} />;
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminMenu />

      <div className="flex-1 p-4 lg:p-8 overflow-auto">
        <div className="max-w-7xl mx-auto">
          <AdminSection
            title="Услуги"
            icon={ShoppingBag}
            count={totalCount}
            loading={loading}
            searchValue={searchQuery}
            onSearchChange={setSearchQuery}
            onAdd={handleAdd}
            addButtonText="Добавить услугу"
          >
            {services.length === 0 ? (
              <EmptyState
                icon={ShoppingBag}
                title="Услуги не найдены"
                description={searchQuery ? 'Попробуйте изменить поисковый запрос' : 'Добавьте первую услугу'}
                actionText={!searchQuery ? 'Добавить услугу' : undefined}
                onAction={!searchQuery ? handleAdd : undefined}
              />
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                  <AnimatePresence>
                    {services.map((service) => (
                    <ItemCard key={service.id}>
                      {/* Image */}
                      <div className="w-full h-32 rounded-xl overflow-hidden bg-gray-100 mb-3">
                        <ImageWithFallback
                          src={service.image_url}
                          alt={service.title}
                          className="w-full h-full object-cover"
                        />
                      </div>

                      {/* Info */}
                      <div>
                        <h3 className="font-semibold text-gray-800 line-clamp-1">{service.title}</h3>
                        <p className="text-sm text-gray-500 line-clamp-2 mt-1">{service.subtitle}</p>
                      </div>

                      {/* Tags */}
                      <div className="flex items-center gap-2 mt-3 flex-wrap">
                        {service.serviceCategory && (
                          <Badge variant="primary">{service.serviceCategory.name}</Badge>
                        )}
                        <Badge variant="success">{service.price} BYN</Badge>
                      </div>

                      {/* Specialists */}
                      {service.specialists.length > 0 && (
                        <div className="mt-2">
                          <Badge variant="secondary">
                            Специалисты ({service.specialists.length})
                          </Badge>
                        </div>
                      )}

                      {/* Actions */}
                      <div className="flex items-center justify-end mt-4 pt-4 border-t border-gray-100">
                        <CardActions
                          onEdit={() => handleEdit(service)}
                          onDelete={() => handleDelete(service.id, service.title)}
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
            title={editingService ? 'Редактирование услуги' : 'Новая услуга'}
            onSubmit={handleSave}
            loading={formLoading}
            disabled={!formData.title || !formData.subtitle || !formData.price || !formData.service_category_id || (specialists.length > 0 && formData.specialist_ids.length === 0)}
          >
            <div className="space-y-6">
              {/* Basic Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField label="Название" required>
                  <FormInput
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="Лечение кариеса"
                  />
                </FormField>

                <FormField label="Цена (BYN)" required>
                  <FormInput
                    type="number"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    placeholder="100"
                  />
                </FormField>
              </div>

              <FormField label="Подзаголовок" required>
                <FormInput
                  type="text"
                  value={formData.subtitle}
                  onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                  placeholder="Краткое описание услуги"
                />
              </FormField>

              <FormField label="Категория услуги" required>
                <CategoryListSelector
                  categories={flattenedServiceCategories}
                  value={formData.service_category_id}
                  onChange={(value) => setFormData({ ...formData, service_category_id: value })}
                  placeholder="Выберите категорию"
                />
              </FormField>

              <div className="grid grid-cols-1 gap-4">
                <FormField label="Специалисты" required={specialists.length > 0}>
                  <div className="space-y-2 max-h-48 overflow-y-auto border border-gray-200 rounded-xl p-3 bg-gray-50">
                    {specialists.length > 0 ? (
                      specialists.map((spec) => (
                        <label key={spec.id} className="flex items-center gap-2 cursor-pointer hover:bg-gray-100 p-2 rounded-lg transition-colors">
                          <input
                            type="checkbox"
                            checked={formData.specialist_ids.includes(spec.id.toString())}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setFormData({
                                  ...formData,
                                  specialist_ids: [...formData.specialist_ids, spec.id.toString()]
                                });
                              } else {
                                setFormData({
                                  ...formData,
                                  specialist_ids: formData.specialist_ids.filter(id => id !== spec.id.toString())
                                });
                              }
                            }}
                            className="w-4 h-4 text-[#18A36C] border-gray-300 rounded focus:ring-[#18A36C]"
                          />
                          <span className="text-sm text-gray-700">{spec.name}</span>
                        </label>
                      ))
                    ) : (
                      <div className="flex flex-col items-center justify-center py-8 text-center">
                        <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center mb-3">
                          <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                          </svg>
                        </div>
                        <p className="text-sm font-medium text-gray-700 mb-1">Специалисты отсутствуют</p>
                        <p className="text-xs text-gray-500">
                          Сначала добавьте специалистов в разделе "Специалисты"
                        </p>
                      </div>
                    )}
                  </div>
                  {specialists.length > 0 && (
                    <p className="text-xs text-gray-500 mt-1">
                      Выбрано: {formData.specialist_ids.length}
                    </p>
                  )}
                </FormField>
              </div>

              <FormField label="Описание">
                <FormTextarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={4}
                  placeholder="Полное описание услуги..."
                />
              </FormField>

              <FormField label="Ссылка на видео (YouTube)">
                <FormInput
                  type="text"
                  value={formData.video_url}
                  onChange={(e) => setFormData({ ...formData, video_url: e.target.value })}
                  placeholder="https://youtube.com/watch?v=..."
                />
              </FormField>

              {/* Images */}
              <div className="border-t border-gray-100 pt-6">
                <h4 className="font-medium text-gray-700 mb-4">Изображения услуги</h4>
                <MultiImageUploader
                  images={{
                    image_url: formData.image_url,
                    image_url_1: formData.image_url_1,
                    image_url_2: formData.image_url_2,
                    image_url_3: formData.image_url_3,
                    image_url_4: formData.image_url_4,
                  }}
                  onChange={(key, url) => setFormData({ ...formData, [key]: url })}
                  folder="smartmedical/services"
                  maxSizeMB={10}
                />
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
