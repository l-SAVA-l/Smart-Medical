'use client';

import { useState, useEffect, useMemo } from 'react';
import { useSession } from 'next-auth/react';
import { AnimatePresence } from 'framer-motion';
import { HelpCircle, Loader2 } from 'lucide-react';
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
  FormSelect,
  Badge,
} from '@/components/SMAdmin/SMAdminSection';
import NotFound from '../../not-found';
import { AdminAuthForm } from '@/components/SMAdmin/SMAdminAuthForm';
import { useAdminSession } from '@/hooks/useAdminSession';
import { AdminAccessSkeleton, AdminQuestionsGridSkeleton } from '@/components/SMAdmin/SMAdminSkeleton';
import { ConfirmDialog } from '@/components/SMAdmin/SMConfirmDialog';
import { useConfirmDialog } from '@/hooks/useConfirmDialog';
import { useAlert } from '@/components/common/SMAlert';
import { useServerPagination } from '@/hooks/useServerPagination';

interface Question {
  id: number;
  question: string;
  answer: string | null;
  category: string | null;
  service_id: number | null;
  question_category_id: number | null;
  service: {
    id: number;
    title: string;
  } | null;
  questionCategory: {
    id: number;
    name: string;
  } | null;
}

interface Service {
  id: number;
  title: string;
}

interface QuestionCategory {
  id: number;
  name: string;
  slug: string;
}


export default function AdminQuestionsPage() {
  const { status } = useSession();
  const { sessionVerified, isLoading: sessionLoading, verifySession } = useAdminSession();
  const [hasAdminRole, setHasAdminRole] = useState<boolean | null>(null);
  const confirmDialog = useConfirmDialog();
  const { success, error: showError } = useAlert();

  // Pagination hook
  const { currentPage, setPage, buildApiUrl } = useServerPagination(12);

  // Data states
  const [questions, setQuestions] = useState<Question[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [services, setServices] = useState<Service[]>([]);
  const [questionCategories, setQuestionCategories] = useState<QuestionCategory[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Form states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [formLoading, setFormLoading] = useState(false);
  const [formData, setFormData] = useState({
    question: '',
    answer: '',
    service_id: '',
    question_category_id: '',
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
      const apiUrl = buildApiUrl('/api/admin/questions', searchQuery);

      const [questionsRes, servicesRes, categoriesRes] = await Promise.all([
        fetch(apiUrl),
        fetch('/api/services'),
        fetch('/api/admin/question-categories'),
      ]);

      if (questionsRes.ok) {
        const response = await questionsRes.json();
        setQuestions(response.data || []);
        setTotalPages(response.totalPages || 1);
        setTotalCount(response.totalCount || 0);
      }

      if (servicesRes.ok) {
        const data = await servicesRes.json();
        setServices(data);
      }

      if (categoriesRes.ok) {
        const data = await categoriesRes.json();
        setQuestionCategories(data);
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
      question: '',
      answer: '',
      service_id: '',
      question_category_id: '',
    });
    setEditingQuestion(null);
    setIsModalOpen(false);
  };

  const handleAdd = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const handleEdit = (question: Question) => {
    setEditingQuestion(question);
    setFormData({
      question: question.question,
      answer: question.answer || '',
      service_id: question.service_id?.toString() || '',
      question_category_id: question.question_category_id?.toString() || '',
    });
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    setFormLoading(true);
    try {
      const url = editingQuestion
        ? `/api/admin/questions/${editingQuestion.id}`
        : '/api/admin/questions';

      const method = editingQuestion ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        await loadData();
        resetForm();
        success(editingQuestion ? 'Вопрос обновлен' : 'Вопрос создан');
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

  const handleDelete = async (id: number, questionText: string) => {
    const confirmed = await confirmDialog.confirm({
      title: 'Удаление вопроса',
      message: `Вы уверены, что хотите удалить вопрос "${questionText.substring(0, 50)}${questionText.length > 50 ? '...' : ''}"? Это действие нельзя отменить.`,
      confirmText: 'Удалить',
      cancelText: 'Отмена',
      variant: 'danger',
    });

    if (!confirmed) return;

    try {
      const res = await fetch(`/api/admin/questions/${id}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        await loadData();
        success('Вопрос удален');
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
            title="Вопросы (FAQ)"
            icon={HelpCircle}
            count={totalCount}
            loading={loading}
            searchValue={searchQuery}
            onSearchChange={setSearchQuery}
            onAdd={handleAdd}
            addButtonText="Добавить вопрос"
            loadingSkeleton={<AdminQuestionsGridSkeleton count={12} />}
          >
            {questions.length === 0 ? (
              <EmptyState
                icon={HelpCircle}
                title="Вопросы не найдены"
                description={searchQuery ? 'Попробуйте изменить поисковый запрос' : 'Добавьте первый вопрос'}
                actionText={!searchQuery ? 'Добавить вопрос' : undefined}
                onAction={!searchQuery ? handleAdd : undefined}
              />
            ) : (
              <>
                <div className="space-y-4">
                  <AnimatePresence>
                    {questions.map((question) => (
                      <ItemCard key={question.id}>
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            {/* Question */}
                            <h3 className="font-semibold text-gray-800 mb-2">{question.question}</h3>

                            {/* Answer */}
                            {question.answer && (
                              <p className="text-sm text-gray-500 line-clamp-2 mb-3">{question.answer}</p>
                            )}

                            {/* Tags */}
                            <div className="flex items-center gap-2 flex-wrap">
                              {question.questionCategory && (
                                <Badge variant="success">Категория: {question.questionCategory.name}</Badge>
                              )}
                              {question.service && (
                                <Badge variant="secondary">Услуга: {question.service.title}</Badge>
                              )}
                              {!question.answer && (
                                <Badge variant="warning">Без ответа</Badge>
                              )}
                            </div>
                          </div>

                          <CardActions
                            onEdit={() => handleEdit(question)}
                            onDelete={() => handleDelete(question.id, question.question)}
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
            title={editingQuestion ? 'Редактирование вопроса' : 'Новый вопрос'}
            onSubmit={handleSave}
            loading={formLoading}
            disabled={!formData.question}
          >
            <div className="space-y-6">
              <FormField label="Вопрос" required>
                <FormTextarea
                  value={formData.question}
                  onChange={(e) => setFormData({ ...formData, question: e.target.value })}
                  rows={2}
                  placeholder="Введите вопрос"
                />
              </FormField>

              <FormField label="Ответ">
                <FormTextarea
                  value={formData.answer}
                  onChange={(e) => setFormData({ ...formData, answer: e.target.value })}
                  rows={4}
                  placeholder="Введите ответ на вопрос"
                />
              </FormField>

              <FormField label="Категория вопроса">
                <FormSelect
                  value={formData.question_category_id}
                  onChange={(e) => setFormData({ ...formData, question_category_id: e.target.value })}
                >
                  <option value="">Не выбрано</option>
                  {questionCategories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </FormSelect>
                <p className="text-xs text-gray-500 mt-1">
                  Выберите категорию для отображения в разделе "Вопросы и ответы"
                </p>
              </FormField>

              <FormField label="Привязка к услуге (опционально)">
                <FormSelect
                  value={formData.service_id}
                  onChange={(e) => setFormData({ ...formData, service_id: e.target.value })}
                >
                  <option value="">Не привязан к услуге</option>
                  {services.map((service) => (
                    <option key={service.id} value={service.id}>
                      {service.title}
                    </option>
                  ))}
                </FormSelect>
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
