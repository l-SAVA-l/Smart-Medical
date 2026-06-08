'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Send, User, Bot, Clock, CheckCheck, Loader2, Headphones, AlertCircle, Ban } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { motion } from 'framer-motion';

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
  operator: {
    id: number;
    name: string;
  } | null;
  messages: ChatMessage[];
}

interface OperatorChatContentProps {
  onError?: (message: string) => void;
  onOpenLoginModal?: () => void;
  onOpenRegisterModal?: () => void;
}

export function OperatorChatContent({ onError, onOpenLoginModal, onOpenRegisterModal }: OperatorChatContentProps) {
  const { data: session, status } = useSession();
  const [chat, setChat] = useState<Chat | null>(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [creating, setCreating] = useState(false);
  const [isBlocked, setIsBlocked] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadChat = useCallback(async () => {
    if (status !== 'authenticated') {
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/operator-chat/my-chat', {
        cache: 'no-store'
      });
      if (response.ok) {
        const data = await response.json();
        setChat(data.chat);
        setIsBlocked(false);
      } else if (response.status === 403) {
        const data = await response.json();
        setIsBlocked(true);
      }
    } catch (error) {
    } finally {
      setLoading(false);
    }
  }, [status]);

  useEffect(() => {
    // Загружаем чат только если пользователь авторизован
    if (status === 'authenticated') {
      loadChat();
    } else if (status === 'unauthenticated') {
      setLoading(false);
    }
    // Автообновление убрано - обновляется только при отправке сообщения и открытии
  }, [status, loadChat]);

  useEffect(() => {
    if (chat) {
      scrollToBottom();
    }
  }, [chat?.messages]);

  // Слушаем событие для перезагрузки чата (когда AI переключает на оператора)
  useEffect(() => {
    const handleReloadChat = () => {
      loadChat();
    };

    window.addEventListener('reloadOperatorChat', handleReloadChat);
    return () => {
      window.removeEventListener('reloadOperatorChat', handleReloadChat);
    };
  }, [loadChat]);

  const handleCreateChat = async () => {
    if (!message.trim() || creating) return;

    setCreating(true);
    try {
      const response = await fetch('/api/operator-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: message.trim() }),
        cache: 'no-store'
      });

      if (response.ok) {
        setMessage('');
        loadChat();
      } else if (response.status === 403) {
        const data = await response.json();
        setIsBlocked(true);
      } else {
        const data = await response.json();
        onError?.(data.error || 'Не удалось создать чат');
      }
    } catch (error) {
      onError?.('Ошибка при создании чата');
    } finally {
      setCreating(false);
    }
  };

  const handleSendMessage = async () => {
    if (!message.trim() || sending || !chat) return;

    setSending(true);
    try {
      const response = await fetch(`/api/operator-chat/${chat.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: message.trim() }),
        cache: 'no-store'
      });

      if (response.ok) {
        setMessage('');
        loadChat();
      } else {
        const data = await response.json();
        onError?.(data.error || 'Не удалось отправить сообщение');
      }
    } catch (error) {
      onError?.('Ошибка при отправке сообщения');
    } finally {
      setSending(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (chat) {
        handleSendMessage();
      } else {
        handleCreateChat();
      }
    }
  };

  const formatTime = (date: string) => {
    const d = new Date(date);
    return d.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
  };

  if (status === 'unauthenticated' || status === 'loading') {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center px-6 py-8">
        <div className="w-20 h-20 bg-[#18A36C]/10 rounded-full flex items-center justify-center mb-6">
          <Headphones className="w-10 h-10 text-[#18A36C]" />
        </div>

        <h3 className="text-xl font-bold text-gray-800 mb-2">
          Чат с оператором
        </h3>
        <p className="text-sm text-gray-600 mb-8 max-w-xs">
          Для общения с оператором необходимо авторизоваться в системе
        </p>

        {/* Login Section */}
        <div className="w-full max-w-sm space-y-3">
          <button
            onClick={onOpenLoginModal}
            className="w-full px-6 py-3 bg-[#18A36C] text-white cursor-pointer rounded-xl hover:bg-[#15905f] transition-all duration-200 font-medium shadow-lg shadow-[#18A36C]/20 hover:shadow-xl hover:shadow-[#18A36C]/30 transform hover:scale-[1.02]"
          >
            Войти
          </button>

          {/* Divider */}
          <div className="flex items-center gap-3 py-2">
            <div className="flex-1 h-px bg-gray-200"></div>
            <span className="text-xs text-gray-400 font-medium">ИЛИ</span>
            <div className="flex-1 h-px bg-gray-200"></div>
          </div>

          {/* Register Section */}
          <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
            <p className="text-sm text-gray-600 mb-3">
              Нет аккаунта?
            </p>
            <button
              onClick={onOpenRegisterModal}
              className="w-full px-6 py-3 bg-white cursor-pointer text-[#18A36C] rounded-lg hover:bg-gray-50 transition-all duration-200 font-medium border-2 border-[#18A36C] hover:shadow-md transform hover:scale-[1.02]"
            >
              Зарегистрироваться
            </button>
          </div>
        </div>

        {/* Info */}
        <p className="text-xs text-gray-500 mt-6 max-w-xs">
          После авторизации вы сможете связаться с нашим оператором в режиме реального времени
        </p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="w-8 h-8 text-[#18A36C] animate-spin" />
      </div>
    );
  }

  if (isBlocked) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center px-6">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
          <Ban className="w-8 h-8 text-red-600" />
        </div>
        <h3 className="text-lg font-semibold text-gray-800 mb-2">
          Доступ заблокирован
        </h3>
        <p className="text-sm text-gray-600 mb-4">
          Ваш доступ к чату с оператором был ограничен. Если вы считаете, что это ошибка, пожалуйста, свяжитесь с нами другим способом.
        </p>
      </div>
    );
  }

  if (!chat) {
    // Форма создания нового чата
    return (
      <div className="flex flex-col h-full">
        <div className="flex-1 flex flex-col items-center justify-center text-center px-6">
          <Headphones className="w-16 h-16 text-[#18A36C] mb-4" />
          <h3 className="text-lg font-semibold text-gray-800 mb-2">
            Чат с оператором
          </h3>
          <p className="text-sm text-gray-600 mb-4">
            Напишите ваш вопрос, и наш оператор свяжется с вами в ближайшее время
          </p>
        </div>

        {/* Input */}
        <div className="p-4 border-t border-gray-200 bg-white">
          <div className="flex gap-2">
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Напишите сообщение..."
              disabled={creating}
              className="flex-1 px-4 py-3 bg-gray-100 rounded-xl border-0 focus:outline-none focus:ring-2 focus:ring-[#18A36C] transition-all disabled:opacity-50"
            />
            <button
              onClick={handleCreateChat}
              disabled={creating || !message.trim()}
              className="w-12 h-12 bg-gradient-to-br from-[#18A36C] to-[#15905f] rounded-xl flex items-center justify-center text-white hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {creating ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Send className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Отображение активного чата
  return (
    <div className="flex flex-col h-full">
      {/* Status Header */}
      <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {chat.status === 'WAITING' && (
              <>
                <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse" />
                <span className="text-xs text-gray-600">Ожидаем оператора...</span>
              </>
            )}
            {chat.status === 'ACTIVE' && chat.operator && (
              <>
                <div className="w-2 h-2 bg-green-500 rounded-full" />
                <span className="text-xs text-gray-600">Оператор: {chat.operator.name}</span>
              </>
            )}
            {chat.status === 'CLOSED' && (
              <>
                <div className="w-2 h-2 bg-gray-400 rounded-full" />
                <span className="text-xs text-gray-600">Чат закрыт</span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
        {chat.messages.map((msg) => (
          <motion.div
            key={msg.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex gap-3 ${msg.sender_type === 'patient' ? 'flex-row-reverse' : ''}`}
          >
            {msg.sender.avatar_url ? (
              <img
                src={msg.sender.avatar_url}
                alt={msg.sender.name}
                className="w-8 h-8 rounded-full object-cover flex-shrink-0"
              />
            ) : (
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${msg.sender_type === 'operator'
                  ? 'bg-gradient-to-br from-[#18A36C] to-[#15905f]'
                  : 'bg-gray-400'
                  }`}
              >
                {msg.sender_type === 'operator' ? (
                  <Bot className="w-4 h-4 text-white" />
                ) : (
                  <User className="w-4 h-4 text-white" />
                )}
              </div>
            )}
            <div className={`max-w-[70%] ${msg.sender_type === 'patient' ? 'items-end' : 'items-start'} flex flex-col`}>
              <div
                className={`rounded-2xl p-3 ${msg.sender_type === 'patient'
                  ? 'bg-gradient-to-br from-[#18A36C] to-[#15905f] text-white'
                  : 'bg-white text-gray-800 shadow-sm border border-gray-200'
                  }`}
              >
                <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
              </div>
              <div className="flex items-center gap-2 mt-1 px-2">
                <Clock className="w-3 h-3 text-gray-400" />
                <span className="text-xs text-gray-500">{formatTime(msg.created_at)}</span>
                {msg.sender_type === 'patient' && msg.is_read && (
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
          <div className="flex gap-2">
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Напишите сообщение..."
              disabled={sending}
              className="flex-1 px-4 py-3 bg-gray-100 rounded-xl border-0 focus:outline-none focus:ring-2 focus:ring-[#18A36C] transition-all disabled:opacity-50"
            />
            <button
              onClick={handleSendMessage}
              disabled={sending || !message.trim()}
              className="w-12 h-12 bg-gradient-to-br from-[#18A36C] to-[#15905f] rounded-xl flex items-center justify-center text-white hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
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

      {chat.status === 'CLOSED' && (
        <div className="p-4 bg-gray-50 border-t border-gray-200 text-center">
          <p className="text-sm text-gray-600">
            Чат закрыт оператором. Создайте новый чат, если у вас есть вопросы.
          </p>
        </div>
      )}
    </div>
  );
}
