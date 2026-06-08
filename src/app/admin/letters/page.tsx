'use client';

import { useState, useEffect, useMemo } from 'react';
import { useSession } from 'next-auth/react';
import { AnimatePresence, motion } from 'framer-motion';
import { Mail, Loader2, Calendar, CheckCircle, Clock, Send, Eye, X, User, Ban, UserCheck } from 'lucide-react';
import { Pagination } from '@/components/common/SMPagination/SMPagination';
import { AdminMenu } from '@/components/SMAdmin/SMAdminMenu';
import {
  AdminSection,
  EmptyState,
  ItemCard,
  CardActions,
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
import { useUnreadCountsContext } from '@/contexts/UnreadCountsContext';

interface LetterMessage {
  id: number;
  sender_type: 'patient' | 'chief_doctor';
  content: string;
  created_at: string;
  is_read: boolean;
}

interface Letter {
  id: number;
  subject: string;
  content: string;
  created_at: string;
  reply: string | null;
  replied_at: string | null;
  is_read: boolean;
  is_reply_read: boolean;
  has_new_patient_message: boolean;
  messages: LetterMessage[];
  patient: {
    id: number;
    name: string;
    email: string;
    phone: string;
    avatar_url: string | null;
    is_messages_blocked: boolean;
  };
}

export default function AdminLettersPage() {
  const { status } = useSession();
  const { sessionVerified, isLoading: sessionLoading, verifySession } = useAdminSession();
  const [hasAdminRole, setHasAdminRole] = useState<boolean | null>(null);
  const [isChiefDoctor, setIsChiefDoctor] = useState(false);
  const confirmDialog = useConfirmDialog();
  const { success, error: showError } = useAlert();
  const { refetch: refetchUnreadCounts } = useUnreadCountsContext();

  // Pagination hook
  const { currentPage, setPage, buildApiUrl } = useServerPagination(12);

  // Data states
  const [letters, setLetters] = useState<Letter[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [unreadCount, setUnreadCount] = useState(0);
  const [repliedCount, setRepliedCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'unread' | 'replied' | 'all'>('unread');
  const [viewingLetter, setViewingLetter] = useState<Letter | null>(null);
  const [replyText, setReplyText] = useState('');
  const [replyLoading, setReplyLoading] = useState(false);
  const [blockLoading, setBlockLoading] = useState(false);

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
      setIsChiefDoctor(data.isChiefDoctor);
    } catch (error) {
      setHasAdminRole(false);
    }
  };

  const handleAuthSuccess = () => {
    verifySession();
  };

  const loadCounts = async () => {
    try {
      // Fetch counts for both statuses
      const [unreadRes, repliedRes] = await Promise.all([
        fetch('/api/admin/letters?page=1&limit=1&status=unread'),
        fetch('/api/admin/letters?page=1&limit=1&status=replied'),
      ]);

      if (unreadRes.ok) {
        const data = await unreadRes.json();
        setUnreadCount(data.totalCount || 0);
      }

      if (repliedRes.ok) {
        const data = await repliedRes.json();
        setRepliedCount(data.totalCount || 0);
      }
    } catch (error) {
    }
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const apiUrl = buildApiUrl('/api/admin/letters', searchQuery) +
        `&status=${filterStatus}`;

      const [res] = await Promise.all([
        fetch(apiUrl),
        loadCounts(), // Load counts in parallel
      ]);

      if (res.ok) {
        const response = await res.json();
        setLetters(response.data || []);
        setTotalPages(response.totalPages || 1);
        setTotalCount(response.totalCount || 0);

        // Помечаем все письма как прочитанные после загрузки
        await fetch('/api/admin/letters/mark-all-read', {
          method: 'POST',
        });

        // Обновляем счетчики непрочитанных
        await refetchUnreadCounts();
      }
    } catch (error) {
      showError('Ошибка загрузки данных');
    } finally {
      setLoading(false);
    }
  };

  // Load data when session is verified or page/search/filter changes
  useEffect(() => {
    if (sessionVerified && hasAdminRole && isChiefDoctor) {
      loadData();
    }
  }, [sessionVerified, hasAdminRole, isChiefDoctor, currentPage, searchQuery, filterStatus]); // eslint-disable-line react-hooks/exhaustive-deps

  // Reset page when search or filter changes
  useEffect(() => {
    setPage(1);
  }, [searchQuery, filterStatus]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleViewLetter = async (letter: Letter) => {
    setViewingLetter(letter);
    setReplyText(letter.reply || '');

    // Mark as read if not already
    if (!letter.is_read) {
      try {
        await fetch(`/api/admin/letters/${letter.id}`);
        // Update local state
        setLetters(prev => prev.map(l =>
          l.id === letter.id ? { ...l, is_read: true } : l
        ));
      } catch (error) {
      }
    }
  };

  const handleSendReply = async () => {
    if (!viewingLetter || !replyText.trim()) return;

    setReplyLoading(true);
    try {
      const res = await fetch(`/api/admin/letters/${viewingLetter.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reply: replyText }),
      });

      if (res.ok) {
        await loadData();
        setViewingLetter(null);
        setReplyText('');
        success('Ответ отправлен');
      } else {
        const error = await res.json();
        showError(error.error || 'Ошибка отправки');
      }
    } catch (error) {
      showError('Ошибка отправки');
    } finally {
      setReplyLoading(false);
    }
  };

  const handleDelete = async (id: number, subject: string) => {
    const confirmed = await confirmDialog.confirm({
      title: 'Удаление письма',
      message: `Вы уверены, что хотите удалить письмо "${subject}"? Это действие нельзя отменить.`,
      confirmText: 'Удалить',
      cancelText: 'Отмена',
      variant: 'danger',
    });

    if (!confirmed) return;

    try {
      const res = await fetch(`/api/admin/letters/${id}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        await loadData();
        success('Письмо удалено');
      } else {
        const error = await res.json();
        showError(error.error || 'Ошибка удаления');
      }
    } catch (error) {
      showError('Ошибка удаления');
    }
  };

  const handleToggleBlock = async (patientId: number, currentlyBlocked: boolean) => {
    const action = currentlyBlocked ? 'разблокировать' : 'заблокировать';
    const confirmed = await confirmDialog.confirm({
      title: currentlyBlocked ? 'Разблокировка пользователя' : 'Блокировка пользователя',
      message: `Вы уверены, что хотите ${action} этого пользователя? ${!currentlyBlocked ? 'Он не сможет отправлять письма.' : ''}`,
      confirmText: currentlyBlocked ? 'Разблокировать' : 'Заблокировать',
      cancelText: 'Отмена',
      variant: currentlyBlocked ? 'warning' : 'danger',
    });

    if (!confirmed) return;

    setBlockLoading(true);
    try {
      const res = await fetch(`/api/admin/users/${patientId}/block`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ blocked: !currentlyBlocked }),
      });

      if (res.ok) {
        // Update local state
        setLetters(prev => prev.map(l =>
          l.patient.id === patientId
            ? { ...l, patient: { ...l.patient, is_messages_blocked: !currentlyBlocked } }
            : l
        ));
        if (viewingLetter && viewingLetter.patient.id === patientId) {
          setViewingLetter(prev => prev ? {
            ...prev,
            patient: { ...prev.patient, is_messages_blocked: !currentlyBlocked }
          } : null);
        }
        success(currentlyBlocked ? 'Пользователь разблокирован' : 'Пользователь заблокирован');
      } else {
        const error = await res.json();
        showError(error.error || 'Ошибка');
      }
    } catch (error) {
      showError('Ошибка при изменении статуса');
    } finally {
      setBlockLoading(false);
    }
  };

  // Get initials from name
  const getInitials = (name: string) => {
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  // Loading state
  if (status === 'loading' || hasAdminRole === null || sessionLoading) {
    return <AdminAccessSkeleton />;
  }

  // Not chief doctor - show 404 (Letters only for CHIEF_DOCTOR)
  if (status === 'unauthenticated' || !hasAdminRole || !isChiefDoctor) {
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
            title="Письма главному врачу"
            icon={Mail}
            count={totalCount}
            loading={loading}
            searchValue={searchQuery}
            onSearchChange={setSearchQuery}
          >
            {/* Filter Tabs */}
            <div className="flex items-center gap-2 mb-6">
              <button
                onClick={() => setFilterStatus('unread')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 cursor-pointer ${filterStatus === 'unread'
                    ? 'bg-amber-500 text-white shadow-md'
                    : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
                  }`}
              >
                <Clock className="w-4 h-4" />
                Без ответа
                {unreadCount > 0 && (
                  <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${filterStatus === 'unread'
                      ? 'bg-white/20 text-white'
                      : 'bg-amber-100 text-amber-700'
                    }`}>
                    {unreadCount}
                  </span>
                )}
              </button>
              <button
                onClick={() => setFilterStatus('replied')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 cursor-pointer ${filterStatus === 'replied'
                    ? 'bg-[#18A36C] text-white shadow-md'
                    : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
                  }`}
              >
                <CheckCircle className="w-4 h-4" />
                С ответом
              </button>
              <button
                onClick={() => setFilterStatus('all')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 cursor-pointer ${filterStatus === 'all'
                    ? 'bg-gray-700 text-white shadow-md'
                    : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
                  }`}
              >
                <Mail className="w-4 h-4" />
                Все письма
              </button>
            </div>

            {letters.length === 0 ? (
              <EmptyState
                icon={Mail}
                title="Письма не найдены"
                description={searchQuery ? 'Попробуйте изменить поисковый запрос' : 'Пока нет писем от пациентов'}
              />
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <AnimatePresence>
                    {letters.map((letter) => (
                      <ItemCard key={letter.id}>
                        <div className="flex gap-4">
                          {/* Avatar */}
                          <div className="w-12 h-12 rounded-full overflow-hidden flex-shrink-0 bg-[#18A36C] flex items-center justify-center">
                            {letter.patient.avatar_url ? (
                              <img
                                src={letter.patient.avatar_url}
                                alt={letter.patient.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <span className="text-sm font-semibold text-white">
                                {getInitials(letter.patient.name)}
                              </span>
                            )}
                          </div>

                          {/* Content */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-semibold text-gray-800 truncate">{letter.subject}</h3>
                              {!letter.is_read && !letter.reply && (
                                <span className="w-2 h-2 bg-amber-500 rounded-full flex-shrink-0" />
                              )}
                            </div>
                            <p className="text-sm text-gray-500 mb-1">{letter.patient.name}</p>
                            <p className="text-xs text-gray-400 flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {new Date(letter.created_at).toLocaleDateString('ru-RU', {
                                day: 'numeric',
                                month: 'long',
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </p>
                          </div>
                        </div>

                        {/* Preview */}
                        <p className="text-sm text-gray-500 line-clamp-2 mt-3">{letter.content}</p>

                        {/* Tags */}
                        <div className="flex items-center gap-2 mt-3 flex-wrap">
                          {letter.patient.is_messages_blocked && (
                            <Badge variant="danger">
                              <Ban className="w-3 h-3 mr-1" />
                              Заблокирован
                            </Badge>
                          )}
                          {letter.has_new_patient_message ? (
                            <Badge variant="warning">Новое сообщение</Badge>
                          ) : letter.reply ? (
                            <Badge variant="success">Отвечено</Badge>
                          ) : (
                            <Badge variant="warning">Ожидает ответа</Badge>
                          )}
                          {letter.messages && letter.messages.length > 0 && (
                            <Badge variant="secondary">{letter.messages.length + 1} сообщ.</Badge>
                          )}
                        </div>

                        {/* Actions */}
                        <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
                          <button
                            onClick={() => handleViewLetter(letter)}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#18A36C] text-white text-sm font-medium rounded-lg hover:bg-[#15905f] transition-colors cursor-pointer"
                          >
                            <Eye className="w-4 h-4" />
                            {letter.reply ? 'Просмотреть' : 'Ответить'}
                          </button>
                          <button
                            onClick={() => handleDelete(letter.id, letter.subject)}
                            className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                            title="Удалить"
                          >
                            <X className="w-4 h-4" />
                          </button>
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

          {/* View/Reply Modal */}
          <AnimatePresence>
            {viewingLetter && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => !replyLoading && setViewingLetter(null)}
                  className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                />
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: 20 }}
                  className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
                >
                  {/* Header */}
                  <div className="bg-[#18A36C] px-6 py-4 flex-shrink-0">
                    <div className="flex items-center justify-between">
                      <h2 className="text-xl font-semibold text-white">Письмо</h2>
                      <button
                        onClick={() => !replyLoading && setViewingLetter(null)}
                        className="p-1.5 hover:bg-white/20 rounded-lg transition-colors cursor-pointer"
                      >
                        <X className="w-5 h-5 text-white" />
                      </button>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-6 overflow-y-auto flex-1">
                    {/* Sender info */}
                    <div className="flex items-start gap-4 mb-4 pb-4 border-b border-gray-100">
                      <div className="w-14 h-14 rounded-full overflow-hidden flex-shrink-0 bg-[#18A36C] flex items-center justify-center">
                        {viewingLetter.patient.avatar_url ? (
                          <img
                            src={viewingLetter.patient.avatar_url}
                            alt={viewingLetter.patient.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span className="text-lg font-semibold text-white">
                            {getInitials(viewingLetter.patient.name)}
                          </span>
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-gray-800 text-lg">{viewingLetter.patient.name}</h3>
                          {viewingLetter.patient.is_messages_blocked && (
                            <span className="px-2 py-0.5 bg-red-100 text-red-600 text-xs font-medium rounded-full flex items-center gap-1">
                              <Ban className="w-3 h-3" />
                              Заблокирован
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-500">{viewingLetter.patient.email}</p>
                        <p className="text-sm text-gray-500">{viewingLetter.patient.phone}</p>
                      </div>
                      <button
                        onClick={() => handleToggleBlock(viewingLetter.patient.id, viewingLetter.patient.is_messages_blocked)}
                        disabled={blockLoading}
                        className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 cursor-pointer ${
                          viewingLetter.patient.is_messages_blocked
                            ? 'bg-green-100 text-green-700 hover:bg-green-200'
                            : 'bg-red-100 text-red-700 hover:bg-red-200'
                        }`}
                        title={viewingLetter.patient.is_messages_blocked ? 'Разблокировать пользователя' : 'Заблокировать пользователя'}
                      >
                        {blockLoading ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : viewingLetter.patient.is_messages_blocked ? (
                          <UserCheck className="w-4 h-4" />
                        ) : (
                          <Ban className="w-4 h-4" />
                        )}
                        {viewingLetter.patient.is_messages_blocked ? 'Разблокировать' : 'Заблокировать'}
                      </button>
                    </div>

                    {/* Subject */}
                    <h4 className="font-semibold text-gray-800 text-lg mb-2">{viewingLetter.subject}</h4>
                    <p className="text-xs text-gray-400 mb-4">
                      {new Date(viewingLetter.created_at).toLocaleDateString('ru-RU', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>

                    {/* Conversation Thread */}
                    <div className="space-y-4 mb-6">
                      {/* Initial message from patient */}
                      <div className="flex gap-3">
                        <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0 bg-[#18A36C] flex items-center justify-center">
                          {viewingLetter.patient.avatar_url ? (
                            <img
                              src={viewingLetter.patient.avatar_url}
                              alt={viewingLetter.patient.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <span className="text-xs font-semibold text-white">
                              {getInitials(viewingLetter.patient.name)}
                            </span>
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="bg-gray-100 rounded-xl p-4">
                            <p className="text-gray-700 whitespace-pre-wrap">{viewingLetter.content}</p>
                          </div>
                          <p className="text-xs text-gray-400 mt-1">
                            {new Date(viewingLetter.created_at).toLocaleDateString('ru-RU', {
                              day: 'numeric',
                              month: 'short',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </p>
                        </div>
                      </div>

                      {/* First reply - always show if exists */}
                      {viewingLetter.reply && (
                        <div className="flex gap-3 justify-end">
                          <div className="flex-1 max-w-[85%]">
                            <div className="bg-[#18A36C]/10 rounded-xl p-4">
                              <p className="text-gray-700 whitespace-pre-wrap">{viewingLetter.reply}</p>
                            </div>
                            <p className="text-xs text-gray-400 mt-1 text-right">
                              <CheckCircle className="w-3 h-3 inline mr-1 text-[#18A36C]" />
                              Вы, {viewingLetter.replied_at && new Date(viewingLetter.replied_at).toLocaleDateString('ru-RU', {
                                day: 'numeric',
                                month: 'short',
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </p>
                          </div>
                        </div>
                      )}

                      {/* Thread messages */}
                      {viewingLetter.messages && viewingLetter.messages.map((msg) => (
                        <div key={msg.id} className={`flex gap-3 ${msg.sender_type === 'chief_doctor' ? 'justify-end' : ''}`}>
                          {msg.sender_type === 'patient' && (
                            <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0 bg-[#18A36C] flex items-center justify-center">
                              {viewingLetter.patient.avatar_url ? (
                                <img
                                  src={viewingLetter.patient.avatar_url}
                                  alt={viewingLetter.patient.name}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <span className="text-xs font-semibold text-white">
                                  {getInitials(viewingLetter.patient.name)}
                                </span>
                              )}
                            </div>
                          )}
                          <div className={`flex-1 ${msg.sender_type === 'chief_doctor' ? 'max-w-[85%]' : ''}`}>
                            <div className={`rounded-xl p-4 ${msg.sender_type === 'chief_doctor' ? 'bg-[#18A36C]/10' : 'bg-gray-100'}`}>
                              <p className="text-gray-700 whitespace-pre-wrap">{msg.content}</p>
                            </div>
                            <p className={`text-xs text-gray-400 mt-1 ${msg.sender_type === 'chief_doctor' ? 'text-right' : ''}`}>
                              {msg.sender_type === 'chief_doctor' && <CheckCircle className="w-3 h-3 inline mr-1 text-[#18A36C]" />}
                              {msg.sender_type === 'chief_doctor' ? 'Вы' : viewingLetter.patient.name.split(' ')[0]}, {new Date(msg.created_at).toLocaleDateString('ru-RU', {
                                day: 'numeric',
                                month: 'short',
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Reply form - always shown for chief doctor */}
                    {isChiefDoctor && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          {viewingLetter.reply ? 'Продолжить переписку' : 'Ваш ответ'}
                        </label>
                        <textarea
                          value={replyText}
                          onChange={(e) => setReplyText(e.target.value)}
                          rows={4}
                          className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#18A36C]/20 focus:border-[#18A36C] transition-all resize-none"
                          placeholder="Введите ваш ответ пациенту..."
                        />
                      </div>
                    )}

                    {/* Not chief doctor warning */}
                    {!isChiefDoctor && (
                      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                        <p className="text-amber-700 text-sm">
                          Только главный врач может отвечать на письма пациентов.
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  {isChiefDoctor && (
                    <div className="flex items-center gap-3 p-6 pt-0 flex-shrink-0">
                      <button
                        onClick={() => setViewingLetter(null)}
                        disabled={replyLoading}
                        className="flex-1 px-4 py-2.5 border border-gray-200 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-colors disabled:opacity-50 cursor-pointer"
                      >
                        Закрыть
                      </button>
                      <button
                        onClick={handleSendReply}
                        disabled={replyLoading || !replyText.trim()}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-[#18A36C] text-white font-medium rounded-xl hover:bg-[#15905f] transition-colors disabled:opacity-50 cursor-pointer"
                      >
                        {replyLoading ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Send className="w-4 h-4" />
                        )}
                        Отправить
                      </button>
                    </div>
                  )}
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
