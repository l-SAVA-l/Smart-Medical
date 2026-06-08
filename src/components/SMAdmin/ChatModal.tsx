'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, User, Bot, Clock, CheckCheck, Loader2, Ban, UserX, Trash2 } from 'lucide-react';
import { Button } from '../common/SMButton/SMButton';
import { Badge } from '../common/SMBadge/SMBadge';
import { useAlert } from '../common/SMAlert/AlertProvider';
import { clearChatNotification } from '@/utils/chatNotifications';

interface ChatMessage {
  id: number;
  chat_id: number;
  sender_id: number;
  sender_type: 'patient' | 'operator';
  content: string;
  created_at: string;
  is_read: boolean;
  sender: {
    id: number;
    name: string;
    avatar_url: string | null;
  };
}

interface Chat {
  id: number;
  patient_id: number;
  operator_id: number | null;
  status: 'WAITING' | 'ACTIVE' | 'CLOSED';
  created_at: string;
  updated_at: string;
  last_message_at: string | null;
  has_unread_operator: boolean;
  has_unread_patient: boolean;
  patient: {
    id: number;
    name: string;
    email: string;
    avatar_url: string | null;
    is_messages_blocked: boolean;
  };
  operator: {
    id: number;
    name: string;
  } | null;
  messages: ChatMessage[];
}

interface ChatModalProps {
  chatId: number;
  onClose: () => void;
}

export function ChatModal({ chatId, onClose }: ChatModalProps) {
  const [chat, setChat] = useState<Chat | null>(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [showBlockConfirm, setShowBlockConfirm] = useState(false);
  const [blocking, setBlocking] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const alert = useAlert();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadChat = useCallback(async () => {
    try {
      const response = await fetch(`/api/operator-chat/${chatId}`);
      if (response.ok) {
        const data = await response.json();
        setChat(data.chat);
        // Clear notification when chat is opened and loaded
        clearChatNotification(chatId);
      } else {
        alert.error('Не удалось загрузить чат', 'Ошибка');
      }
    } catch (error) {
      alert.error('Ошибка при загрузке чата', 'Ошибка');
    } finally {
      setLoading(false);
    }
  }, [chatId, alert]);

  useEffect(() => {
    loadChat();
    // Автообновление убрано - обновляется только при отправке сообщения и открытии
  }, [loadChat]);

  useEffect(() => {
    if (chat) {
      scrollToBottom();
    }
  }, [chat?.messages]);

  const handleTakeChat = async () => {
    try {
      const response = await fetch(`/api/operator-chat/${chatId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'take' }),
      });

      if (response.ok) {
        alert.success('Вы взяли чат', 'Успех');
        loadChat();
      } else {
        alert.error('Не удалось взять чат', 'Ошибка');
      }
    } catch (error) {
      alert.error('Ошибка при взятии чата', 'Ошибка');
    }
  };

  const handleCloseChat = async () => {
    try {
      const response = await fetch(`/api/operator-chat/${chatId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'CLOSED' }),
      });

      if (response.ok) {
        alert.success('Чат закрыт', 'Успех');
        onClose();
      } else {
        alert.error('Не удалось закрыть чат', 'Ошибка');
      }
    } catch (error) {
      alert.error('Ошибка при закрытии чата', 'Ошибка');
    }
  };

  const handleBlockUser = () => {
    if (!chat) return;
    setShowBlockConfirm(true);
  };

  const confirmBlockUser = async () => {
    if (!chat || blocking) return;

    const action = chat.patient.is_messages_blocked ? 'unblock' : 'block';
    setBlocking(true);

    try {
      const response = await fetch(`/api/operator-chat/${chatId}/block`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      });

      const data = await response.json();

      if (response.ok) {
        alert.success(
          action === 'block' ? 'Пользователь заблокирован и все его чаты удалены' : 'Пользователь разблокирован',
          'Успех'
        );
        if (action === 'block') {
          // Чат удален, закрываем модалку
          onClose();
        } else {
          await loadChat();
          setShowBlockConfirm(false);
        }
      } else {
        alert.error(data.error || 'Не удалось ' + (action === 'block' ? 'заблокировать' : 'разблокировать') + ' пользователя', 'Ошибка');
      }
    } catch (error) {
      alert.error('Ошибка при блокировке/разблокировке', 'Ошибка');
    } finally {
      setBlocking(false);
    }
  };

  const handleDeleteChat = () => {
    setShowDeleteConfirm(true);
  };

  const confirmDeleteChat = async () => {
    if (!chat || deleting) return;

    setDeleting(true);

    try {
      const response = await fetch(`/api/operator-chat/${chatId}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (response.ok) {
        alert.success('Чат удален', 'Успех');
        onClose();
      } else {
        alert.error(data.error || 'Не удалось удалить чат', 'Ошибка');
      }
    } catch (error) {
      alert.error('Ошибка при удалении чата', 'Ошибка');
    } finally {
      setDeleting(false);
    }
  };

  const handleSendMessage = async () => {
    if (!message.trim() || sending) return;

    setSending(true);
    try {
      const response = await fetch(`/api/operator-chat/${chatId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: message.trim() }),
      });

      if (response.ok) {
        setMessage('');
        loadChat();
      } else {
        const data = await response.json();
        alert.error(data.error || 'Не удалось отправить сообщение', 'Ошибка');
      }
    } catch (error) {
      alert.error('Ошибка при отправке сообщения', 'Ошибка');
    } finally {
      setSending(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'WAITING':
        return <Badge variant="outline" className="border-amber-400 text-amber-700 bg-amber-50">Ожидает</Badge>;
      case 'ACTIVE':
        return <Badge variant="default" className="bg-[#18A36C] text-white border-transparent shadow-sm">Активный</Badge>;
      case 'CLOSED':
        return <Badge variant="secondary" className="bg-gray-200 text-gray-700">Закрыт</Badge>;
      default:
        return null;
    }
  };

  const formatTime = (date: string) => {
    const d = new Date(date);
    return d.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        {/* Overlay */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative z-10 w-full max-w-3xl bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh]"
        >
          {loading ? (
            <div className="flex items-center justify-center h-96">
              <Loader2 className="w-8 h-8 text-[#18A36C] animate-spin" />
            </div>
          ) : chat ? (
            <>
              {/* Header */}
              <div className="bg-white border-b border-gray-200 p-4 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                  {chat.patient.avatar_url ? (
                    <img
                      src={chat.patient.avatar_url}
                      alt={chat.patient.name}
                      className="w-12 h-12 sm:w-14 sm:h-14 rounded-full object-cover border-2 border-gray-200 flex-shrink-0"
                    />
                  ) : (
                    <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-[#18A36C] to-[#15905f] rounded-full flex items-center justify-center shadow-md flex-shrink-0">
                      <User className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <h2 className="text-lg sm:text-xl font-bold text-gray-900 truncate">{chat.patient.name}</h2>
                    <p className="text-gray-600 text-xs sm:text-sm truncate">{chat.patient.email}</p>
                    <div className="mt-1.5 flex items-center gap-2 flex-wrap">
                      {getStatusBadge(chat.status)}
                      {chat.patient.is_messages_blocked && (
                        <Badge variant="secondary" className="bg-gray-700 text-white text-xs">
                          <Ban className="w-3 h-3 mr-1" />
                          Заблокирован
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  {chat.status !== 'CLOSED' && (
                    <>
                      {chat.status === 'WAITING' && (
                        <Button
                          onClick={handleTakeChat}
                          className="bg-[#18A36C] text-white hover:bg-[#15905f] shadow-sm cursor-pointer"
                        >
                          Взять чат
                        </Button>
                      )}
                      {chat.status === 'ACTIVE' && (
                        <Button
                          onClick={handleCloseChat}
                          variant="outline"
                          className="text-gray-700 border-gray-300 cursor-pointer"
                        >
                          Закрыть чат
                        </Button>
                      )}
                    </>
                  )}
                  <button
                    onClick={handleDeleteChat}
                    title="Удалить чат"
                    className="w-10 h-10 rounded-lg flex items-center justify-center transition-all bg-red-50 text-red-600 hover:bg-red-100 cursor-pointer"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                  <button
                    onClick={handleBlockUser}
                    title={chat.patient.is_messages_blocked ? 'Разблокировать' : 'Заблокировать'}
                    className={`w-10 h-10 rounded-lg flex items-center justify-center transition-all cursor-pointer ${chat.patient.is_messages_blocked
                      ? 'bg-[#18A36C]/10 text-[#18A36C] hover:bg-[#18A36C]/20'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                  >
                    {chat.patient.is_messages_blocked ? (
                      <UserX className="w-5 h-5" />
                    ) : (
                      <Ban className="w-5 h-5" />
                    )}
                  </button>
                  <button
                    onClick={onClose}
                    className="w-10 h-10 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-600 transition-colors cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gradient-to-b from-gray-50 to-white">
                {chat.messages.map((msg) => (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex gap-3 ${msg.sender_type === 'operator' ? 'flex-row-reverse' : ''}`}
                  >
                    {msg.sender.avatar_url ? (
                      <img
                        src={msg.sender.avatar_url}
                        alt={msg.sender.name}
                        className="w-10 h-10 rounded-full object-cover flex-shrink-0 shadow-sm"
                      />
                    ) : (
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 shadow-sm ${msg.sender_type === 'operator'
                          ? 'bg-gradient-to-br from-[#18A36C] to-[#15905f]'
                          : 'bg-gradient-to-br from-gray-400 to-gray-500'
                          }`}
                      >
                        {msg.sender_type === 'operator' ? (
                          <Bot className="w-5 h-5 text-white" />
                        ) : (
                          <User className="w-5 h-5 text-white" />
                        )}
                      </div>
                    )}
                    <div className={`max-w-[70%] ${msg.sender_type === 'operator' ? 'items-end' : 'items-start'} flex flex-col`}>
                      <div
                        className={`rounded-2xl p-4 shadow-sm ${msg.sender_type === 'operator'
                          ? 'bg-gradient-to-br from-[#18A36C] to-[#15905f] text-white'
                          : 'bg-white text-gray-800 border border-gray-200'
                          }`}
                      >
                        <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                      </div>
                      <div className="flex items-center gap-2 mt-1.5 px-2">
                        <Clock className="w-3 h-3 text-gray-400" />
                        <span className="text-xs text-gray-500">{formatTime(msg.created_at)}</span>
                        {msg.sender_type === 'operator' && msg.is_read && (
                          <CheckCheck className="w-4 h-4 text-[#18A36C]" />
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              {chat.status !== 'CLOSED' && (
                <div className="p-4 bg-white border-t border-gray-200">
                  <div className="flex gap-3">
                    <input
                      type="text"
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="Напишите сообщение..."
                      disabled={sending}
                      className="flex-1 px-4 py-3 bg-gray-50 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#18A36C] focus:border-transparent transition-all disabled:opacity-50"
                    />
                    <button
                      onClick={handleSendMessage}
                      disabled={sending || !message.trim()}
                      className="w-12 h-12 bg-gradient-to-br from-[#18A36C] to-[#15905f] rounded-xl flex items-center justify-center text-white hover:shadow-md hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 cursor-pointer"
                    >
                      {sending ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                      ) : (
                        <Send className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="flex items-center justify-center h-96">
              <p className="text-gray-600">Чат не найден</p>
            </div>
          )}
        </motion.div>

        {/* Block Confirmation Modal */}
        {showBlockConfirm && chat && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-20 flex items-center justify-center bg-black/40 backdrop-blur-sm"
            onClick={() => setShowBlockConfirm(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 overflow-hidden"
            >
              {/* Header */}
              <div className={`p-6 ${chat.patient.is_messages_blocked
                ? 'bg-gradient-to-r from-[#18A36C] to-[#15905f]'
                : 'bg-gradient-to-r from-[#18A36C] to-[#15905f]'
                }`}>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                    {chat.patient.is_messages_blocked ? (
                      <UserX className="w-6 h-6 text-white" />
                    ) : (
                      <Ban className="w-6 h-6 text-white" />
                    )}
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">
                      {chat.patient.is_messages_blocked ? 'Разблокировать пользователя?' : 'Заблокировать пользователя?'}
                    </h3>
                    <p className="text-sm text-white/80">{chat.patient.name}</p>
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="p-6">
                <p className="text-gray-700 leading-relaxed">
                  {chat.patient.is_messages_blocked
                    ? 'Пользователь сможет снова создавать новые чаты и отправлять сообщения.'
                    : 'Пользователь не сможет создавать новые чаты и отправлять сообщения. Все его чаты будут удалены.'}
                </p>
              </div>

              {/* Actions */}
              <div className="px-6 pb-6 flex gap-3 justify-end">
                <Button
                  variant="outline"
                  onClick={() => setShowBlockConfirm(false)}
                  disabled={blocking}
                  className="border-gray-300 text-gray-700 hover:bg-gray-50 cursor-pointer"
                >
                  Отмена
                </Button>
                <Button
                  onClick={confirmBlockUser}
                  disabled={blocking}
                  className={
                    chat.patient.is_messages_blocked
                      ? 'bg-[#18A36C] hover:bg-[#15905f] text-white shadow-md flex items-center gap-2 cursor-pointer'
                      : 'bg-gray-700 hover:bg-gray-800 text-white shadow-md flex items-center gap-2 cursor-pointer'
                  }
                >
                  {blocking && <Loader2 className="w-4 h-4 animate-spin" />}
                  {chat.patient.is_messages_blocked ? 'Разблокировать' : 'Заблокировать'}
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* Delete Confirmation Modal */}
        {showDeleteConfirm && chat && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-20 flex items-center justify-center bg-black/40 backdrop-blur-sm"
            onClick={() => setShowDeleteConfirm(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 overflow-hidden"
            >
              {/* Header */}
              <div className="p-6 bg-gradient-to-r from-red-500 to-red-600">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                    <Trash2 className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">
                      Удалить чат?
                    </h3>
                    <p className="text-sm text-white/80">{chat.patient.name}</p>
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="p-6">
                <p className="text-gray-700 leading-relaxed">
                  Все сообщения в этом чате будут удалены безвозвратно. Это действие нельзя отменить.
                </p>
              </div>

              {/* Actions */}
              <div className="px-6 pb-6 flex gap-3 justify-end">
                <Button
                  variant="outline"
                  onClick={() => setShowDeleteConfirm(false)}
                  disabled={deleting}
                  className="border-gray-300 text-gray-700 hover:bg-gray-50 cursor-pointer"
                >
                  Отмена
                </Button>
                <Button
                  onClick={confirmDeleteChat}
                  disabled={deleting}
                  className="bg-red-500 hover:bg-red-600 text-white shadow-md flex items-center gap-2 cursor-pointer"
                >
                  {deleting && <Loader2 className="w-4 h-4 animate-spin" />}
                  Удалить
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </div>
    </AnimatePresence>
  );
}
