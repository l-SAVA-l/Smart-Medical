'use client';

import { useState, useEffect, useMemo } from 'react';
import { useSession } from 'next-auth/react';
import { AnimatePresence, motion } from 'framer-motion';
import { MessageSquare, Loader2, Star, Calendar, CheckCircle, Clock, Check, Eye, X } from 'lucide-react';
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
  FormSelect,
  FormDateInput,
  Badge,
} from '@/components/SMAdmin/SMAdminSection';
import NotFound from '../../not-found';
import { AdminAuthForm } from '@/components/SMAdmin/SMAdminAuthForm';
import { useAdminSession } from '@/hooks/useAdminSession';
import { AdminAccessSkeleton, AdminFeedbacksGridSkeleton } from '@/components/SMAdmin/SMAdminSkeleton';
import { ConfirmDialog } from '@/components/SMAdmin/SMConfirmDialog';
import { useConfirmDialog } from '@/hooks/useConfirmDialog';
import { useAlert } from '@/components/common/SMAlert';
import { useServerPagination } from '@/hooks/useServerPagination';
import { useUnreadCountsContext } from '@/contexts/UnreadCountsContext';

interface Feedback {
  id: number;
  name: string;
  text: string;
  date: string;
  grade: number;
  image_url: string;
  verified: boolean;
  service_id: number | null;
  service: {
    id: number;
    title: string;
  } | null;
}

interface Service {
  id: number;
  title: string;
}

export default function AdminFeedbacksPage() {
  const { status } = useSession();
  const { sessionVerified, isLoading: sessionLoading, verifySession } = useAdminSession();
  const [hasAdminRole, setHasAdminRole] = useState<boolean | null>(null);
  const [isCheckingRole, setIsCheckingRole] = useState(true);
  const confirmDialog = useConfirmDialog();
  const { success, error: showError } = useAlert();
  const { refetch: refetchUnreadCounts } = useUnreadCountsContext();

  // Pagination hook
  const { currentPage, setPage, buildApiUrl, itemsPerPage } = useServerPagination(12);
  const ITEMS_PER_PAGE = itemsPerPage;

  // Data states
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [pendingCount, setPendingCount] = useState(0);
  const [approvedCount, setApprovedCount] = useState(0);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'pending' | 'approved'>('pending');
  const [viewingFeedback, setViewingFeedback] = useState<Feedback | null>(null);
  const [approvingFeedback, setApprovingFeedback] = useState<Feedback | null>(null);
  const [approveData, setApproveData] = useState({ service_id: '', verified: true });
  const [approveLoading, setApproveLoading] = useState(false);

  // Form states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingFeedback, setEditingFeedback] = useState<Feedback | null>(null);
  const [formLoading, setFormLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    text: '',
    date: '',
    grade: '5',
    image_url: '',
    verified: false,
    service_id: '',
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

  const loadCounts = async () => {
    try {
      // Fetch counts for both statuses
      const [pendingRes, approvedRes] = await Promise.all([
        fetch('/api/admin/feedbacks?page=1&limit=1&status=pending'),
        fetch('/api/admin/feedbacks?page=1&limit=1&status=approved'),
      ]);

      if (pendingRes.ok) {
        const data = await pendingRes.json();
        setPendingCount(data.totalCount || 0);
      }

      if (approvedRes.ok) {
        const data = await approvedRes.json();
        setApprovedCount(data.totalCount || 0);
      }
    } catch (error) {
    }
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const apiUrl = buildApiUrl('/api/admin/feedbacks', searchQuery) +
        `&status=${filterStatus}`;

      const [feedbacksRes, servicesRes] = await Promise.all([
        fetch(apiUrl),
        fetch('/api/services'),
        loadCounts(), // Load counts in parallel
      ]);

      if (feedbacksRes.ok) {
        const response = await feedbacksRes.json();
        setFeedbacks(response.data || []);
        setTotalPages(response.totalPages || 1);
        setTotalCount(response.totalCount || 0);
      }

      if (servicesRes.ok) {
        const data = await servicesRes.json();
        setServices(data);
      }
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };

  // Load data when session is verified or page/search/filter changes
  useEffect(() => {
    if (sessionVerified && hasAdminRole) {
      loadData();
    }
  }, [sessionVerified, hasAdminRole, currentPage, searchQuery, filterStatus]); // eslint-disable-line react-hooks/exhaustive-deps

  // Reset page when search or filter changes
  useEffect(() => {
    setPage(1);
  }, [searchQuery, filterStatus]); // eslint-disable-line react-hooks/exhaustive-deps

  // Form handlers
  const resetForm = () => {
    setFormData({
      name: '',
      text: '',
      date: '',
      grade: '5',
      image_url: '',
      verified: false,
      service_id: '',
    });
    setEditingFeedback(null);
    setIsModalOpen(false);
  };

  const handleAdd = () => {
    resetForm();
    setFormData(prev => ({
      ...prev,
      date: new Date().toISOString().split('T')[0],
      verified: true, // Отзывы созданные через админку сразу одобрены
    }));
    setIsModalOpen(true);
  };

  const handleEdit = (feedback: Feedback) => {
    setEditingFeedback(feedback);
    setFormData({
      name: feedback.name,
      text: feedback.text,
      date: new Date(feedback.date).toISOString().split('T')[0],
      grade: feedback.grade.toString(),
      image_url: feedback.image_url,
      verified: feedback.verified,
      service_id: feedback.service_id?.toString() || '',
    });
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    setFormLoading(true);
    try {
      const url = editingFeedback
        ? `/api/admin/feedbacks/${editingFeedback.id}`
        : '/api/admin/feedbacks';

      const method = editingFeedback ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        await loadData();
        resetForm();
        success(editingFeedback ? 'Отзыв обновлен' : 'Отзыв создан');
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

  const openApproveModal = (feedback: Feedback) => {
    setApprovingFeedback(feedback);
    setApproveData({ service_id: '', verified: true });
  };

  const handleApproveSubmit = async () => {
    if (!approvingFeedback) return;

    setApproveLoading(true);
    try {
      const res = await fetch(`/api/admin/feedbacks/${approvingFeedback.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          verified: approveData.verified,
          service_id: approveData.service_id || null,
        }),
      });

      if (res.ok) {
        await loadData();
        setApprovingFeedback(null);
        success('Отзыв одобрен');
        // Обновляем счетчики непрочитанных
        await refetchUnreadCounts();
      } else {
        const error = await res.json();
        showError(error.error || 'Ошибка одобрения');
      }
    } catch (error) {
      showError('Ошибка одобрения');
    } finally {
      setApproveLoading(false);
    }
  };

  const handleDelete = async (id: number, feedbackAuthor: string) => {
    const confirmed = await confirmDialog.confirm({
      title: 'Удаление отзыва',
      message: `Вы уверены, что хотите удалить отзыв от "${feedbackAuthor}"? Это действие нельзя отменить.`,
      confirmText: 'Удалить',
      cancelText: 'Отмена',
      variant: 'danger',
    });

    if (!confirmed) return;

    try {
      const res = await fetch(`/api/admin/feedbacks/${id}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        await loadData();
        success('Отзыв удален');
        // Обновляем счетчики непрочитанных
        await refetchUnreadCounts();
      } else {
        const error = await res.json();
        showError(error.error || 'Ошибка удаления');
      }
    } catch (error) {
      showError('Ошибка удаления');
    }
  };

  // Render stars
  const renderStars = (grade: number) => {
    return (
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-4 h-4 ${star <= grade ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`}
          />
        ))}
      </div>
    );
  };

  // Loading state - показываем skeleton с блюром пока проверяем права
  if (status === 'loading' || hasAdminRole === null || sessionLoading || isCheckingRole) {
    return <AdminAccessSkeleton />;
  }

  // Not admin - show 404 (только после завершения проверки)
  if (status === 'unauthenticated' || hasAdminRole === false) {
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
            title="Отзывы"
            icon={MessageSquare}
            count={totalCount}
            loading={loading}
            searchValue={searchQuery}
            onSearchChange={setSearchQuery}
            onAdd={handleAdd}
            addButtonText="Добавить отзыв"
            loadingSkeleton={<AdminFeedbacksGridSkeleton count={ITEMS_PER_PAGE} />}
          >
            {/* Filter Tabs */}
            <div className="flex items-center gap-2 mb-6">
              <button
                onClick={() => setFilterStatus('pending')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 cursor-pointer ${filterStatus === 'pending'
                    ? 'bg-amber-500 text-white shadow-md'
                    : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
                  }`}
              >
                <Clock className="w-4 h-4" />
                На модерации
                {pendingCount > 0 && (
                  <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${filterStatus === 'pending'
                      ? 'bg-white/20 text-white'
                      : 'bg-amber-100 text-amber-700'
                    }`}>
                    {pendingCount}
                  </span>
                )}
              </button>
              <button
                onClick={() => setFilterStatus('approved')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 cursor-pointer ${filterStatus === 'approved'
                    ? 'bg-[#18A36C] text-white shadow-md'
                    : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
                  }`}
              >
                <CheckCircle className="w-4 h-4" />
                Одобренные
              </button>
            </div>

            {feedbacks.length === 0 ? (
              <EmptyState
                icon={MessageSquare}
                title="Отзывы не найдены"
                description={searchQuery ? 'Попробуйте изменить поисковый запрос' : 'Добавьте первый отзыв'}
                actionText={!searchQuery ? 'Добавить отзыв' : undefined}
                onAction={!searchQuery ? handleAdd : undefined}
              />
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <AnimatePresence>
                    {feedbacks.map((feedback) => {
                      // Генерация инициалов из имени
                      const getInitials = (name: string) => {
                        const parts = name.trim().split(/\s+/);
                        if (parts.length >= 2) {
                          return (parts[0][0] + parts[1][0]).toUpperCase();
                        }
                        return name.slice(0, 2).toUpperCase();
                      };

                      return (
                        <ItemCard key={feedback.id}>
                          <div className="flex gap-4">
                            {/* Avatar */}
                            <div className="w-14 h-14 rounded-full overflow-hidden flex-shrink-0 bg-gray-100 flex items-center justify-center">
                              {feedback.image_url ? (
                                <img
                                  src={feedback.image_url}
                                  alt={feedback.name}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <span className="text-lg font-semibold text-gray-500">
                                  {getInitials(feedback.name)}
                                </span>
                              )}
                            </div>

                            {/* Content */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <h3 className="font-semibold text-gray-800">{feedback.name}</h3>
                                {feedback.verified && (
                                  <CheckCircle className="w-4 h-4 text-[#18A36C]" />
                                )}
                              </div>

                              <div className="flex items-center gap-3 mb-2">
                                {renderStars(feedback.grade)}
                                <span className="text-xs text-gray-400 flex items-center gap-1">
                                  <Calendar className="w-3 h-3" />
                                  {new Date(feedback.date).toLocaleDateString('ru-RU', {
                                    day: 'numeric',
                                    month: 'long',
                                    year: 'numeric',
                                  })}
                                </span>
                              </div>

                              <p className="text-sm text-gray-500 line-clamp-2">{feedback.text}</p>
                            </div>
                          </div>

                          {/* Tags */}
                          <div className="flex items-center gap-2 mt-3">
                            {feedback.service && (
                              <Badge variant="secondary">{feedback.service.title}</Badge>
                            )}
                            {!feedback.service && (
                              <Badge variant="primary">Без услуги</Badge>
                            )}
                            {feedback.verified ? (
                              <Badge variant="success">Опубликован</Badge>
                            ) : (
                              <Badge variant="warning">На модерации</Badge>
                            )}
                          </div>

                          {/* Actions */}
                          <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
                            {!feedback.verified ? (
                              <button
                                onClick={() => openApproveModal(feedback)}
                                className="flex items-center gap-1.5 px-3 py-1.5 bg-[#18A36C] text-white text-sm font-medium rounded-lg hover:bg-[#15905f] transition-colors cursor-pointer"
                              >
                                <Check className="w-4 h-4" />
                                Одобрить
                              </button>
                            ) : (
                              <div />
                            )}
                            <div className="flex items-center gap-2">
                              {!feedback.verified ? (
                                <button
                                  onClick={() => setViewingFeedback(feedback)}
                                  className="p-2 text-gray-400 hover:text-[#18A36C] hover:bg-[#18A36C]/10 rounded-lg transition-colors cursor-pointer"
                                  title="Просмотреть"
                                >
                                  <Eye className="w-4 h-4" />
                                </button>
                              ) : (
                                <CardActions
                                  onEdit={() => handleEdit(feedback)}
                                  onDelete={() => handleDelete(feedback.id, feedback.name)}
                                />
                              )}
                              {!feedback.verified && (
                                <button
                                  onClick={() => handleDelete(feedback.id, feedback.name)}
                                  className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                                  title="Удалить"
                                >
                                  <X className="w-4 h-4" />
                                </button>
                              )}
                            </div>
                          </div>
                        </ItemCard>
                      );
                    })}
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
            title={editingFeedback ? 'Редактирование отзыва' : 'Новый отзыв'}
            onSubmit={handleSave}
            loading={formLoading}
            disabled={!formData.name || !formData.text}
          >
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <FormField label="Имя автора" required>
                  <FormInput
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Иван Иванов"
                  />
                </FormField>

                <FormField label="Дата" required>
                  <FormDateInput
                    value={formData.date}
                    onChange={(date) => setFormData({ ...formData, date })}
                  />
                </FormField>
              </div>

              <FormField label="Текст отзыва" required>
                <FormTextarea
                  value={formData.text}
                  onChange={(e) => setFormData({ ...formData, text: e.target.value })}
                  rows={4}
                  placeholder="Текст отзыва"
                />
              </FormField>

              <div className="grid grid-cols-2 gap-4">
                <FormField label="Оценка (1-5)" required>
                  <FormSelect
                    value={formData.grade}
                    onChange={(e) => setFormData({ ...formData, grade: e.target.value })}
                  >
                    <option value="5">5 - Отлично</option>
                    <option value="4">4 - Хорошо</option>
                    <option value="3">3 - Нормально</option>
                    <option value="2">2 - Плохо</option>
                    <option value="1">1 - Ужасно</option>
                  </FormSelect>
                </FormField>

                <FormField label="Привязка к услуге">
                  <FormSelect
                    value={formData.service_id}
                    onChange={(e) => setFormData({ ...formData, service_id: e.target.value })}
                  >
                    <option value="">Без привязки к услуге</option>
                    {services.map((service) => (
                      <option key={service.id} value={service.id}>
                        {service.title}
                      </option>
                    ))}
                  </FormSelect>
                </FormField>
              </div>

              <FormField label="Фото автора">
                <ImageUploader
                  value={formData.image_url}
                  onChange={(url) => setFormData({ ...formData, image_url: url })}
                  folder="smartmedical/feedbacks"
                  placeholder="Загрузите фото автора отзыва"
                  maxSizeMB={5}
                />
              </FormField>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, verified: !formData.verified })}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer ${formData.verified ? 'bg-[#18A36C]' : 'bg-gray-300'
                    }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${formData.verified ? 'translate-x-6' : 'translate-x-1'
                      }`}
                  />
                </button>
                <span className="text-sm text-gray-700">
                  {formData.verified ? 'Показывать в общих отзывах клиники' : 'Не показывать в общих отзывах клиники'}
                </span>
              </div>
            </div>
          </FormModal>

          {/* View Modal for pending reviews */}
          <AnimatePresence>
            {viewingFeedback && (
              <div className="fixed inset-0 z-50 flex items-center justify-center">
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => setViewingFeedback(null)}
                  className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                />
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: 20 }}
                  className="relative w-full max-w-lg mx-4 bg-white rounded-2xl shadow-2xl overflow-hidden"
                >
                  {/* Header */}
                  <div className="bg-[#18A36C] px-6 py-4">
                    <div className="flex items-center justify-between">
                      <h2 className="text-xl font-semibold text-white">Просмотр отзыва</h2>
                      <button
                        onClick={() => setViewingFeedback(null)}
                        className="p-1.5 hover:bg-white/20 rounded-lg transition-colors cursor-pointer"
                      >
                        <X className="w-5 h-5 text-white" />
                      </button>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-6">
                    <div className="flex items-start gap-4 mb-4">
                      <div className="w-14 h-14 rounded-full overflow-hidden flex-shrink-0 bg-gray-100 flex items-center justify-center">
                        {viewingFeedback.image_url ? (
                          <img
                            src={viewingFeedback.image_url}
                            alt={viewingFeedback.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span className="text-lg font-semibold text-gray-500">
                            {viewingFeedback.name.trim().split(/\s+/).length >= 2
                              ? (viewingFeedback.name.trim().split(/\s+/)[0][0] + viewingFeedback.name.trim().split(/\s+/)[1][0]).toUpperCase()
                              : viewingFeedback.name.slice(0, 2).toUpperCase()}
                          </span>
                        )}
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-800 text-lg">{viewingFeedback.name}</h3>
                        <div className="flex items-center gap-2 mt-1">
                          {renderStars(viewingFeedback.grade)}
                          <span className="text-sm text-gray-500">
                            {new Date(viewingFeedback.date).toLocaleDateString('ru-RU', {
                              day: 'numeric',
                              month: 'long',
                              year: 'numeric',
                            })}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="bg-gray-50 rounded-xl p-4 mb-4">
                      <p className="text-gray-700 whitespace-pre-wrap">{viewingFeedback.text}</p>
                    </div>

                    {viewingFeedback.service && (
                      <div className="mb-4">
                        <span className="text-sm text-gray-500">Услуга: </span>
                        <span className="text-sm font-medium text-gray-700">{viewingFeedback.service.title}</span>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex items-center gap-3 pt-4 border-t border-gray-100">
                      <button
                        onClick={() => {
                          openApproveModal(viewingFeedback);
                          setViewingFeedback(null);
                        }}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-[#18A36C] text-white font-medium rounded-xl hover:bg-[#15905f] transition-colors cursor-pointer"
                      >
                        <Check className="w-4 h-4" />
                        Одобрить
                      </button>
                      <button
                        onClick={() => {
                          handleDelete(viewingFeedback.id, viewingFeedback.name);
                          setViewingFeedback(null);
                        }}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-red-500 text-white font-medium rounded-xl hover:bg-red-600 transition-colors cursor-pointer"
                      >
                        <X className="w-4 h-4" />
                        Отклонить
                      </button>
                    </div>
                  </div>
                </motion.div>
              </div>
            )}
          </AnimatePresence>

          {/* Approve Modal */}
          <AnimatePresence>
            {approvingFeedback && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => !approveLoading && setApprovingFeedback(null)}
                  className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                />
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: 20 }}
                  className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden"
                >
                  {/* Header */}
                  <div className="bg-[#18A36C] px-6 py-4">
                    <div className="flex items-center justify-between">
                      <h2 className="text-xl font-semibold text-white">Одобрение отзыва</h2>
                      <button
                        onClick={() => !approveLoading && setApprovingFeedback(null)}
                        className="p-1.5 hover:bg-white/20 rounded-lg transition-colors cursor-pointer"
                      >
                        <X className="w-5 h-5 text-white" />
                      </button>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-6 space-y-5">
                    {/* Preview */}
                    <div className="p-4 bg-gray-50 rounded-xl">
                      <p className="text-sm text-gray-500 mb-1">Отзыв от</p>
                      <p className="font-medium text-gray-800">{approvingFeedback.name}</p>
                      <p className="text-sm text-gray-600 mt-2 line-clamp-2">{approvingFeedback.text}</p>
                    </div>

                    {/* Service select */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        Привязка к услуге
                      </label>
                      <select
                        value={approveData.service_id}
                        onChange={(e) => setApproveData({ ...approveData, service_id: e.target.value })}
                        className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#18A36C]/20 focus:border-[#18A36C] transition-all"
                      >
                        <option value="">Без привязки к услуге</option>
                        {services.map((service) => (
                          <option key={service.id} value={service.id}>
                            {service.title}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Show in clinic reviews toggle */}
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => setApproveData({ ...approveData, verified: !approveData.verified })}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer ${approveData.verified ? 'bg-[#18A36C]' : 'bg-gray-300'
                          }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${approveData.verified ? 'translate-x-6' : 'translate-x-1'
                            }`}
                        />
                      </button>
                      <span className="text-sm text-gray-700">
                        Показывать в общих отзывах клиники
                      </span>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-3 pt-2">
                      <button
                        onClick={() => setApprovingFeedback(null)}
                        disabled={approveLoading}
                        className="flex-1 px-4 py-2.5 border border-gray-200 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-colors disabled:opacity-50 cursor-pointer"
                      >
                        Отмена
                      </button>
                      <button
                        onClick={handleApproveSubmit}
                        disabled={approveLoading}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-[#18A36C] text-white font-medium rounded-xl hover:bg-[#15905f] transition-colors disabled:opacity-50 cursor-pointer"
                      >
                        {approveLoading ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Check className="w-4 h-4" />
                        )}
                        Одобрить
                      </button>
                    </div>
                  </div>
                </motion.div>
              </div>
            )}
          </AnimatePresence>

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
