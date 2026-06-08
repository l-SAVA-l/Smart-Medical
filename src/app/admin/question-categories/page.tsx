'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { AnimatePresence } from 'framer-motion';
import { HelpCircle, Loader2 } from 'lucide-react';
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
import { AdminAccessSkeleton, AdminQuestionsGridSkeleton } from '@/components/SMAdmin/SMAdminSkeleton';
import { ConfirmDialog } from '@/components/SMAdmin/SMConfirmDialog';
import { useConfirmDialog } from '@/hooks/useConfirmDialog';
import { useAlert } from '@/components/common/SMAlert';
import { generateSlug } from '@/utils/slug';

interface QuestionCategory {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  order: number;
  is_active: boolean;
  _count: {
    questions: number;
  };
}

export default function AdminQuestionCategoriesPage() {
  const { status } = useSession();
  const { sessionVerified, isLoading: sessionLoading, verifySession } = useAdminSession();
  const [hasAdminRole, setHasAdminRole] = useState<boolean | null>(null);
  const confirmDialog = useConfirmDialog();
  const { success, error: showError } = useAlert();

  // Data states
  const [categories, setCategories] = useState<QuestionCategory[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Form states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<QuestionCategory | null>(null);
  const [formLoading, setFormLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    order: '',
  });
  const [orderWarning, setOrderWarning] = useState('');

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
    loadData();
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/question-categories');
      const data = await res.json();
      setCategories(data);
    } catch (error) {
      showError('Ошибка загрузки данных');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (sessionVerified) {
      loadData();
    }
  }, [sessionVerified]);

  const handleAdd = () => {
    setEditingCategory(null);
    setFormData({ name: '', slug: '', description: '', order: '' });
    setOrderWarning('');
    setIsModalOpen(true);
  };

  const handleEdit = (category: QuestionCategory) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      slug: category.slug,
      description: category.description || '',
      order: category.order.toString(),
    });
    setOrderWarning('');
    setIsModalOpen(true);
  };

  const resetForm = () => {
    setFormData({ name: '', slug: '', description: '', order: '' });
    setEditingCategory(null);
    setOrderWarning('');
    setIsModalOpen(false);
  };

  const checkOrderAvailability = (order: string) => {
    if (!order) {
      setOrderWarning('');
      return;
    }

    const orderNum = parseInt(order);
    const conflicting = categories.find(cat => {
      if (editingCategory && cat.id === editingCategory.id) return false;
      return cat.order === orderNum;
    });

    if (conflicting) {
      setOrderWarning(`⚠️ Порядок ${orderNum} уже занят категорией "${conflicting.name}"`);
    } else {
      setOrderWarning('');
    }
  };

  const handleSubmit = async () => {
    if (!formData.name || !formData.slug) {
      showError('Заполните обязательные поля');
      return;
    }

    setFormLoading(true);

    try {
      const url = editingCategory
        ? `/api/admin/question-categories/${editingCategory.id}`
        : '/api/admin/question-categories';

      const res = await fetch(url, {
        method: editingCategory ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          slug: formData.slug,
          description: formData.description || null,
          order: formData.order ? parseInt(formData.order) : 0,
        }),
      });

      if (res.ok) {
        await loadData();
        resetForm();
        success(editingCategory ? 'Категория обновлена' : 'Категория создана');
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

  const handleDelete = async (id: number, name: string) => {
    const confirmed = await confirmDialog.confirm({
      title: 'Удаление категории',
      message: `Вы уверены, что хотите удалить категорию "${name}"? Это действие нельзя отменить.`,
      confirmText: 'Удалить',
      cancelText: 'Отмена',
      variant: 'danger',
    });

    if (!confirmed) return;

    try {
      const res = await fetch(`/api/admin/question-categories/${id}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        await loadData();
        success('Категория удалена');
      } else {
        const error = await res.json();
        showError(error.error || 'Ошибка удаления');
      }
    } catch (error) {
      showError('Ошибка удаления');
    }
  };

  const filteredCategories = categories.filter(cat =>
    cat.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    cat.slug.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
            title="Категории вопросов"
            icon={HelpCircle}
            count={filteredCategories.length}
            loading={loading}
            searchValue={searchQuery}
            onSearchChange={setSearchQuery}
            onAdd={handleAdd}
            addButtonText="Добавить категорию"
            loadingSkeleton={<AdminQuestionsGridSkeleton count={8} />}
          >
            {filteredCategories.length === 0 ? (
              <EmptyState
                icon={HelpCircle}
                title="Категории не найдены"
                description={searchQuery ? 'Попробуйте изменить поисковый запрос' : 'Добавьте первую категорию'}
                actionText={!searchQuery ? 'Добавить категорию' : undefined}
                onAction={!searchQuery ? handleAdd : undefined}
              />
            ) : (
              <div className="space-y-4">
                <AnimatePresence>
                  {filteredCategories.map((category) => (
                    <ItemCard key={category.id}>
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="font-semibold text-gray-800">{category.name}</h3>
                            <Badge variant={category.is_active ? 'success' : 'secondary'}>
                              {category.is_active ? 'Активна' : 'Неактивна'}
                            </Badge>
                            <Badge variant="secondary">Порядок: {category.order}</Badge>
                            <Badge variant="primary">{category._count.questions} вопросов</Badge>
                          </div>

                          <p className="text-sm text-gray-500 mb-2">Slug: /{category.slug}</p>

                          {category.description && (
                            <p className="text-sm text-gray-600 line-clamp-2">{category.description}</p>
                          )}
                        </div>

                        <CardActions
                          onEdit={() => handleEdit(category)}
                          onDelete={() => handleDelete(category.id, category.name)}
                        />
                      </div>
                    </ItemCard>
                  ))}
                </AnimatePresence>
              </div>
            )}
          </AdminSection>
        </div>
      </div>

      {/* Form Modal */}
      <FormModal
        isOpen={isModalOpen}
        onClose={resetForm}
        title={editingCategory ? 'Редактировать категорию' : 'Добавить категорию'}
        onSubmit={handleSubmit}
        submitText={editingCategory ? 'Сохранить' : 'Создать'}
        loading={formLoading}
      >
        <FormField label="Название" required>
          <FormInput
            placeholder="Например: Детское здоровье"
            value={formData.name}
            onChange={(e) => {
              const name = e.target.value;
              setFormData({
                ...formData,
                name,
                slug: generateSlug(name)
              });
            }}
          />
        </FormField>

        <FormField label="Slug (URL)" required>
          <FormInput
            placeholder="detskoe-zdorovye"
            value={formData.slug}
            onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
          />
        </FormField>

        <FormField label="Описание">
          <FormTextarea
            placeholder="Краткое описание категории"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            rows={3}
          />
        </FormField>

        <FormField label="Порядок сортировки" required>
          <FormInput
            type="number"
            placeholder="0"
            value={formData.order}
            onChange={(e) => {
              setFormData({ ...formData, order: e.target.value });
              checkOrderAvailability(e.target.value);
            }}
          />
          {orderWarning && (
            <p className="text-orange-600 text-sm mt-1">{orderWarning}</p>
          )}
        </FormField>
      </FormModal>

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
  );
}
