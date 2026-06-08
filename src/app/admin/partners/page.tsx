'use client';

import { useState, useEffect, useMemo } from 'react';
import { useSession } from 'next-auth/react';
import { AnimatePresence } from 'framer-motion';
import { Handshake, Globe, Hash } from 'lucide-react';
import { Pagination } from '@/components/common/SMPagination/SMPagination';
import { ImageUploader } from '@/components/ImageUploader';
import { AdminMenu } from '@/components/SMAdmin/SMAdminMenu';
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

interface Partner {
  id: number;
  name: string;
  description: string;
  image_url: string;
  website_url: string;
  number: number;
  category_id: number;
  category: {
    id: number;
    name: string;
    slug: string;
  };
}

export default function AdminPartnersPage() {
  const { status } = useSession();
  const { sessionVerified, isLoading: sessionLoading, verifySession } = useAdminSession();
  const [hasAdminRole, setHasAdminRole] = useState<boolean | null>(null);
  const confirmDialog = useConfirmDialog();
  const { success, error: showError } = useAlert();

  // Data states
  const [partners, setPartners] = useState<Partner[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [categories, setCategories] = useState<{ id: number; name: string; slug: string }[]>([]);
  // Pagination hook
  const { currentPage, setPage, buildApiUrl } = useServerPagination(12);

  // Form states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPartner, setEditingPartner] = useState<Partner | null>(null);
  const [formLoading, setFormLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    image_url: '',
    website_url: '',
    number: '1',
    category_id: '',
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

  const loadCategories = async () => {
    try {
      const res = await fetch('/api/categories');
      if (res.ok) {
        const data = await res.json();
        // Фильтруем только категории партнёров
        const partnerCategories = data.filter((cat: { slug: string }) =>
          ['medical-labs', 'insurance', 'dental-labs'].includes(cat.slug)
        );
        setCategories(partnerCategories);
      }
    } catch (error) {
    }
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const apiUrl = buildApiUrl('/api/admin/partners', searchQuery);

      const res = await fetch(apiUrl);
      if (res.ok) {
        const response = await res.json();
        setPartners(response.data || []);
        setTotalPages(response.totalPages || 1);
        setTotalCount(response.totalCount || 0);
      }
    } catch (error) {
      showError('Ошибка загрузки данных');
    } finally {
      setLoading(false);
    }
  };

  // Load categories once when session is verified
  useEffect(() => {
    if (sessionVerified && hasAdminRole) {
      loadCategories();
    }
  }, [sessionVerified, hasAdminRole]); // eslint-disable-line react-hooks/exhaustive-deps

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
      description: '',
      image_url: '',
      website_url: '',
      number: '1',
      category_id: '',
    });
    setEditingPartner(null);
    setIsModalOpen(false);
  };

  const handleAdd = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const handleEdit = (partner: Partner) => {
    setEditingPartner(partner);
    setFormData({
      name: partner.name,
      description: partner.description,
      image_url: partner.image_url,
      website_url: partner.website_url,
      number: partner.number.toString(),
      category_id: partner.category_id.toString(),
    });
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    setFormLoading(true);
    try {
      const url = editingPartner
        ? `/api/admin/partners/${editingPartner.id}`
        : '/api/admin/partners';

      const method = editingPartner ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        await loadData();
        resetForm();
        success(editingPartner ? 'Партнёр обновлен' : 'Партнёр создан');
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

  const handleDelete = async (id: number, partnerName: string) => {
    const confirmed = await confirmDialog.confirm({
      title: 'Удаление партнёра',
      message: `Вы уверены, что хотите удалить партнёра "${partnerName}"? Это действие нельзя отменить.`,
      confirmText: 'Удалить',
      cancelText: 'Отмена',
      variant: 'danger',
    });

    if (!confirmed) return;

    try {
      const res = await fetch(`/api/admin/partners/${id}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        await loadData();
        success('Партнёр удален');
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
            title="Партнёры"
            icon={Handshake}
            count={totalCount}
            loading={loading}
            searchValue={searchQuery}
            onSearchChange={setSearchQuery}
            onAdd={handleAdd}
            addButtonText="Добавить партнёра"
          >
            {partners.length === 0 ? (
              <EmptyState
                icon={Handshake}
                title="Партнёры не найдены"
                description={searchQuery ? 'Попробуйте изменить поисковый запрос' : 'Добавьте первого партнёра'}
                actionText={!searchQuery ? 'Добавить партнёра' : undefined}
                onAction={!searchQuery ? handleAdd : undefined}
              />
            ) : (
              <>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                <AnimatePresence>
                  {partners.map((partner) => (
                    <ItemCard key={partner.id}>
                      <div className="flex gap-4">
                        {/* Logo */}
                        <div className="w-16 h-16 rounded-xl overflow-hidden flex-shrink-0 bg-gray-100">
                          {partner.image_url ? (
                            <img
                              src={partner.image_url}
                              alt={partner.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-400">
                              <Handshake className="w-8 h-8" />
                            </div>
                          )}
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-gray-800 truncate">{partner.name}</h3>
                          <p className="text-sm text-gray-500 line-clamp-2">{partner.description}</p>
                        </div>
                      </div>

                      {/* Tags */}
                      <div className="flex items-center gap-2 mt-3">
                        <Badge variant="primary">
                          {partner.category.name}
                        </Badge>
                        <Badge variant="secondary">
                          <Hash className="w-3 h-3 mr-1" />
                          {partner.number}
                        </Badge>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
                        <a
                          href={partner.website_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-[#18A36C] hover:underline flex items-center gap-1"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Globe className="w-3 h-3" />
                          Сайт
                        </a>
                        <CardActions
                          onEdit={() => handleEdit(partner)}
                          onDelete={() => handleDelete(partner.id, partner.name)}
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
            title={editingPartner ? 'Редактирование партнёра' : 'Новый партнёр'}
            onSubmit={handleSave}
            loading={formLoading}
            disabled={!formData.name || !formData.description || !formData.category_id}
          >
            <div className="space-y-6">
              <FormField label="Название" required>
                <FormInput
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Название компании"
                />
              </FormField>

              <FormField label="Описание" required>
                <FormTextarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={4}
                  placeholder="Описание партнёра"
                />
              </FormField>

              <FormField label="Логотип компании" required>
                <ImageUploader
                  value={formData.image_url}
                  onChange={(url) => setFormData({ ...formData, image_url: url })}
                  folder="smartmedical/partners"
                  placeholder="Загрузите логотип партнёра"
                  maxSizeMB={5}
                />
              </FormField>

              <FormField label="Ссылка на сайт" required>
                <FormInput
                  type="text"
                  value={formData.website_url}
                  onChange={(e) => setFormData({ ...formData, website_url: e.target.value })}
                  placeholder="https://example.com"
                />
              </FormField>

              <FormField label="Категория" required>
                <select
                  value={formData.category_id}
                  onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#18A36C]/20 focus:border-[#18A36C] transition-all"
                >
                  <option value="">Выберите категорию</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </FormField>

              <FormField label="Порядковый номер">
                <FormInput
                  type="number"
                  value={formData.number}
                  onChange={(e) => setFormData({ ...formData, number: e.target.value })}
                  placeholder="1"
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
