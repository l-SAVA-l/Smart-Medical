'use client';

import { ReactNode, useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { LucideIcon, Plus, Search, Loader2, Calendar, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '../common/SMButton/SMButton';
import { AdminGridSkeleton } from './SMAdminSkeleton';

interface AdminSectionProps {
  title: string;
  icon: LucideIcon;
  count: number;
  loading: boolean;
  searchValue: string;
  onSearchChange: (value: string) => void;
  onAdd?: () => void;
  children: ReactNode;
  addButtonText?: string;
  loadingSkeleton?: ReactNode;
}

export function AdminSection({
  title,
  icon: Icon,
  count,
  loading,
  searchValue,
  onSearchChange,
  onAdd,
  children,
  addButtonText = 'Добавить',
  loadingSkeleton,
}: AdminSectionProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden"
    >
      {/* Header */}
      <div className="bg-gradient-to-r from-gray-50 to-white p-6 border-b border-gray-100">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-[#18A36C] to-[#15905f] rounded-xl flex items-center justify-center shadow-lg shadow-[#18A36C]/20">
              <Icon className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-800">{title}</h2>
              <p className="text-sm text-gray-500 mt-0.5">
                Всего записей: <span className="font-medium text-[#18A36C]">{count}</span>
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto">
            {/* Search */}
            <div className="relative flex-1 sm:flex-initial">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                name="admin-search-query"
                placeholder="Поиск..."
                value={searchValue}
                onChange={(e) => onSearchChange(e.target.value)}
                autoComplete="off"
                className="pl-10 pr-4 py-2.5 w-full sm:w-64 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#18A36C]/20 focus:border-[#18A36C] transition-all"
              />
            </div>

            {/* Add button */}
            {onAdd && (
              <Button
                onClick={onAdd}
                className="bg-gradient-to-r from-[#18A36C] to-[#15905f] hover:from-[#15905f] hover:to-[#128a54] text-white shadow-lg shadow-[#18A36C]/20 rounded-xl px-5 py-2.5 transition-all hover:shadow-xl hover:shadow-[#18A36C]/30 whitespace-nowrap cursor-pointer"
              >
                <Plus className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">{addButtonText}</span>
                <span className="sm:hidden">Добавить</span>
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {loading ? (
          loadingSkeleton || <AdminGridSkeleton count={12} />
        ) : (
          children
        )}
      </div>
    </motion.div>
  );
}

// Компонент для пустого состояния
interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  actionText?: string;
  onAction?: () => void;
}

export function EmptyState({ icon: Icon, title, description, actionText, onAction }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      <div className="w-20 h-20 bg-gray-100 rounded-2xl flex items-center justify-center mb-6">
        <Icon className="w-10 h-10 text-gray-400" />
      </div>
      <h3 className="text-lg font-medium text-gray-700 mb-2">{title}</h3>
      <p className="text-gray-500 text-center max-w-md mb-6">{description}</p>
      {actionText && onAction && (
        <Button
          onClick={onAction}
          className="bg-[#18A36C] hover:bg-[#15905f] text-white rounded-xl cursor-pointer"
        >
          <Plus className="w-4 h-4 mr-2" />
          {actionText}
        </Button>
      )}
    </div>
  );
}

// Компонент карточки элемента
interface ItemCardProps {
  children: ReactNode;
  onClick?: () => void;
}

export function ItemCard({ children, onClick }: ItemCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      whileHover={{ y: -2 }}
      transition={{ duration: 0.2 }}
      onClick={onClick}
      className={`bg-white border border-gray-100 rounded-xl p-5 hover:shadow-lg hover:border-[#18A36C]/20 transition-all duration-300 ${onClick ? 'cursor-pointer' : ''}`}
    >
      {children}
    </motion.div>
  );
}

// Компонент действий карточки
interface CardActionsProps {
  onEdit: () => void;
  onDelete: () => void;
}

export function CardActions({ onEdit, onDelete }: CardActionsProps) {
  return (
    <div className="flex items-center gap-2">
      <button
        onClick={(e) => {
          e.stopPropagation();
          onEdit();
        }}
        className="p-2 text-gray-400 hover:text-[#18A36C] hover:bg-[#18A36C]/10 rounded-lg transition-all duration-200 transform hover:scale-110 active:scale-95 cursor-pointer"
        title="Редактировать"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
        </svg>
      </button>
      <button
        onClick={(e) => {
          e.stopPropagation();
          onDelete();
        }}
        className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all duration-200 transform hover:scale-110 active:scale-95 cursor-pointer"
        title="Удалить"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
        </svg>
      </button>
    </div>
  );
}

// Компонент модального окна для форм
interface FormModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  onSubmit: () => void;
  submitText?: string;
  loading?: boolean;
  disabled?: boolean;
}

export function FormModal({
  isOpen,
  onClose,
  title,
  children,
  onSubmit,
  submitText = 'Сохранить',
  loading = false,
  disabled = false,
}: FormModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
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
        className="relative w-full max-w-2xl max-h-[90vh] bg-white rounded-2xl shadow-2xl overflow-hidden mx-4"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
          <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-all duration-200 transform hover:scale-110 active:scale-95 cursor-pointer"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          {children}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-100 bg-gray-50">
          <Button
            variant="outline"
            onClick={onClose}
            className="rounded-xl cursor-pointer"
          >
            Отмена
          </Button>
          <Button
            onClick={onSubmit}
            disabled={loading || disabled}
            className="bg-gradient-to-r from-[#18A36C] to-[#15905f] text-white rounded-xl min-w-[120px] cursor-pointer"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              submitText
            )}
          </Button>
        </div>
      </motion.div>
    </div>
  );
}

// Компонент поля формы
interface FormFieldProps {
  label: string;
  required?: boolean;
  children: ReactNode;
  error?: string;
}

export function FormField({ label, required, children, error }: FormFieldProps) {
  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      {children}
      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  );
}

// Стилизованный input
export function FormInput({
  ...props
}: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#18A36C]/20 focus:border-[#18A36C] transition-all"
    />
  );
}

// Стилизованный textarea
export function FormTextarea({
  ...props
}: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      {...props}
      className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#18A36C]/20 focus:border-[#18A36C] transition-all resize-none"
    />
  );
}

// Стилизованный date input с кастомным календарем
interface FormDateInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

const MONTHS_RU = [
  'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
  'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'
];

const MONTHS_SHORT_RU = [
  'Янв', 'Фев', 'Мар', 'Апр', 'Май', 'Июн',
  'Июл', 'Авг', 'Сен', 'Окт', 'Ноя', 'Дек'
];

const WEEKDAYS_RU = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];

type CalendarView = 'days' | 'months' | 'years';

export function FormDateInput({ value, onChange, placeholder }: FormDateInputProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [view, setView] = useState<CalendarView>('days');
  const [viewDate, setViewDate] = useState(() => {
    if (value) return new Date(value);
    return new Date();
  });
  const containerRef = useRef<HTMLDivElement>(null);

  // Закрытие при клике вне компонента
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setView('days');
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const formatDisplayDate = (dateString: string) => {
    if (!dateString) return placeholder || 'Выберите дату';
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();

    let startDay = firstDay.getDay() - 1;
    if (startDay < 0) startDay = 6;

    const days: (number | null)[] = [];

    for (let i = 0; i < startDay; i++) {
      days.push(null);
    }

    for (let i = 1; i <= daysInMonth; i++) {
      days.push(i);
    }

    return days;
  };

  const handlePrevMonth = () => {
    setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1));
  };

  const handlePrevYear = () => {
    setViewDate(new Date(viewDate.getFullYear() - 1, viewDate.getMonth(), 1));
  };

  const handleNextYear = () => {
    setViewDate(new Date(viewDate.getFullYear() + 1, viewDate.getMonth(), 1));
  };

  const handlePrevDecade = () => {
    setViewDate(new Date(viewDate.getFullYear() - 12, viewDate.getMonth(), 1));
  };

  const handleNextDecade = () => {
    setViewDate(new Date(viewDate.getFullYear() + 12, viewDate.getMonth(), 1));
  };

  const handleSelectDay = (day: number) => {
    const selectedDate = new Date(viewDate.getFullYear(), viewDate.getMonth(), day);
    const formatted = selectedDate.toISOString().split('T')[0];
    onChange(formatted);
    setIsOpen(false);
    setView('days');
  };

  const handleSelectMonth = (month: number) => {
    setViewDate(new Date(viewDate.getFullYear(), month, 1));
    setView('days');
  };

  const handleSelectYear = (year: number) => {
    setViewDate(new Date(year, viewDate.getMonth(), 1));
    setView('months');
  };

  const isSelectedDay = (day: number) => {
    if (!value) return false;
    const selected = new Date(value);
    return (
      selected.getDate() === day &&
      selected.getMonth() === viewDate.getMonth() &&
      selected.getFullYear() === viewDate.getFullYear()
    );
  };

  const isToday = (day: number) => {
    const today = new Date();
    return (
      today.getDate() === day &&
      today.getMonth() === viewDate.getMonth() &&
      today.getFullYear() === viewDate.getFullYear()
    );
  };

  const isCurrentMonth = (month: number) => {
    const today = new Date();
    return today.getMonth() === month && today.getFullYear() === viewDate.getFullYear();
  };

  const isSelectedMonth = (month: number) => {
    if (!value) return false;
    const selected = new Date(value);
    return selected.getMonth() === month && selected.getFullYear() === viewDate.getFullYear();
  };

  const isCurrentYear = (year: number) => {
    const today = new Date();
    return today.getFullYear() === year;
  };

  const isSelectedYear = (year: number) => {
    if (!value) return false;
    const selected = new Date(value);
    return selected.getFullYear() === year;
  };

  const days = getDaysInMonth(viewDate);
  const startYear = Math.floor(viewDate.getFullYear() / 12) * 12;
  const years = Array.from({ length: 12 }, (_, i) => startYear + i);

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full px-4 py-2.5 pr-10 border rounded-xl text-sm text-left transition-all bg-white cursor-pointer ${
          isOpen
            ? 'border-[#18A36C] ring-2 ring-[#18A36C]/20'
            : 'border-gray-200 hover:border-gray-300'
        } ${value ? 'text-gray-900' : 'text-gray-400'}`}
      >
        {formatDisplayDate(value)}
      </button>
      <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#18A36C] pointer-events-none" />

      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.15 }}
          className="absolute top-full left-0 mt-2 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden z-50 w-[320px]"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-[#18A36C] to-[#15905f] px-4 py-3">
            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={view === 'days' ? handlePrevMonth : view === 'months' ? handlePrevYear : handlePrevDecade}
                className="p-1.5 hover:bg-white/20 rounded-lg transition-colors cursor-pointer"
              >
                <ChevronLeft className="w-5 h-5 text-white" />
              </button>

              <button
                type="button"
                onClick={() => setView(view === 'days' ? 'months' : view === 'months' ? 'years' : 'years')}
                className="px-3 py-1 hover:bg-white/20 rounded-lg transition-colors cursor-pointer"
              >
                <span className="font-semibold text-white">
                  {view === 'days' && `${MONTHS_RU[viewDate.getMonth()]} ${viewDate.getFullYear()}`}
                  {view === 'months' && viewDate.getFullYear()}
                  {view === 'years' && `${startYear} - ${startYear + 11}`}
                </span>
              </button>

              <button
                type="button"
                onClick={view === 'days' ? handleNextMonth : view === 'months' ? handleNextYear : handleNextDecade}
                className="p-1.5 hover:bg-white/20 rounded-lg transition-colors cursor-pointer"
              >
                <ChevronRight className="w-5 h-5 text-white" />
              </button>
            </div>
          </div>

          <div className="p-4">
            {/* Days View */}
            {view === 'days' && (
              <>
                <div className="grid grid-cols-7 gap-1 mb-2">
                  {WEEKDAYS_RU.map((day, i) => (
                    <div
                      key={day}
                      className={`text-center text-xs font-semibold py-2 ${
                        i >= 5 ? 'text-red-400' : 'text-gray-400'
                      }`}
                    >
                      {day}
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-7 gap-1">
                  {days.map((day, index) => (
                    <div key={index} className="aspect-square p-0.5">
                      {day !== null && (
                        <button
                          type="button"
                          onClick={() => handleSelectDay(day)}
                          className={`w-full h-full flex items-center justify-center text-sm rounded-xl transition-all font-medium cursor-pointer ${
                            isSelectedDay(day)
                              ? 'bg-gradient-to-br from-[#18A36C] to-[#15905f] text-white shadow-lg shadow-[#18A36C]/30'
                              : isToday(day)
                              ? 'bg-[#18A36C]/10 text-[#18A36C] ring-2 ring-[#18A36C]/30'
                              : 'text-gray-700 hover:bg-gray-100'
                          }`}
                        >
                          {day}
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </>
            )}

            {/* Months View */}
            {view === 'months' && (
              <div className="grid grid-cols-3 gap-2">
                {MONTHS_SHORT_RU.map((month, index) => (
                  <button
                    key={month}
                    type="button"
                    onClick={() => handleSelectMonth(index)}
                    className={`py-3 px-2 rounded-xl text-sm font-medium transition-all cursor-pointer ${
                      isSelectedMonth(index)
                        ? 'bg-gradient-to-br from-[#18A36C] to-[#15905f] text-white shadow-lg shadow-[#18A36C]/30'
                        : isCurrentMonth(index)
                        ? 'bg-[#18A36C]/10 text-[#18A36C] ring-2 ring-[#18A36C]/30'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    {month}
                  </button>
                ))}
              </div>
            )}

            {/* Years View */}
            {view === 'years' && (
              <div className="grid grid-cols-3 gap-2">
                {years.map((year) => (
                  <button
                    key={year}
                    type="button"
                    onClick={() => handleSelectYear(year)}
                    className={`py-3 px-2 rounded-xl text-sm font-medium transition-all cursor-pointer ${
                      isSelectedYear(year)
                        ? 'bg-gradient-to-br from-[#18A36C] to-[#15905f] text-white shadow-lg shadow-[#18A36C]/30'
                        : isCurrentYear(year)
                        ? 'bg-[#18A36C]/10 text-[#18A36C] ring-2 ring-[#18A36C]/30'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    {year}
                  </button>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      )}
    </div>
  );
}

// Стилизованный select
export function FormSelect({
  children,
  ...props
}: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      {...props}
      className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#18A36C]/20 focus:border-[#18A36C] transition-all bg-white"
    >
      {children}
    </select>
  );
}

// Badge компонент
interface BadgeProps {
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger';
}

export function Badge({ children, variant = 'primary' }: BadgeProps) {
  const variants = {
    primary: 'bg-[#18A36C]/10 text-[#18A36C]',
    secondary: 'bg-gray-100 text-gray-600',
    success: 'bg-green-100 text-green-700',
    warning: 'bg-amber-100 text-amber-700',
    danger: 'bg-red-100 text-red-700',
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium ${variants[variant]}`}>
      {children}
    </span>
  );
}
