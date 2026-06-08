'use client';

// Базовый компонент скелетона
function Skeleton({ className = '' }: { className?: string }) {
  return (
    <div className={`animate-pulse bg-gray-200 rounded ${className}`} />
  );
}

// Скелетон для карточки в админке
export function AdminItemCardSkeleton() {
  return (
    <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm">
      <div className="flex gap-4 mb-4">
        {/* Изображение/Аватар */}
        <Skeleton className="w-16 h-16 rounded-xl flex-shrink-0" />

        {/* Информация */}
        <div className="flex-1 min-w-0 space-y-2">
          <Skeleton className="h-5 w-3/4" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-2/3" />
        </div>
      </div>

      {/* Теги/Badges */}
      <div className="flex items-center gap-2 mb-4">
        <Skeleton className="h-6 w-20 rounded-full" />
        <Skeleton className="h-6 w-16 rounded-full" />
      </div>

      {/* Нижняя часть с кнопками */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
        <Skeleton className="h-4 w-24" />
        <div className="flex gap-2">
          <Skeleton className="h-8 w-8 rounded-lg" />
          <Skeleton className="h-8 w-8 rounded-lg" />
        </div>
      </div>
    </div>
  );
}

// Скелетон для верхней части секции (заголовок + поиск + кнопка)
export function AdminSectionHeaderSkeleton() {
  return (
    <div className="bg-white rounded-2xl p-6 mb-6 border border-gray-100">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        {/* Заголовок с иконкой */}
        <div className="flex items-center gap-3">
          <Skeleton className="w-10 h-10 rounded-xl" />
          <div>
            <Skeleton className="h-7 w-40 mb-2" />
            <Skeleton className="h-4 w-32" />
          </div>
        </div>

        {/* Поиск и кнопка */}
        <div className="flex flex-col sm:flex-row gap-3 lg:w-auto w-full">
          <Skeleton className="h-11 w-full sm:w-64 rounded-xl" />
          <Skeleton className="h-11 w-full sm:w-48 rounded-xl" />
        </div>
      </div>
    </div>
  );
}

// Скелетон для сетки карточек
export function AdminGridSkeleton({ count = 12 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <AdminItemCardSkeleton key={i} />
      ))}
    </div>
  );
}

// Полный скелетон для секции админки
export function AdminSectionSkeleton({ itemCount = 12 }: { itemCount?: number }) {
  return (
    <>
      <AdminSectionHeaderSkeleton />
      <AdminGridSkeleton count={itemCount} />
    </>
  );
}

// Скелетон для списка (2 колонки, как в отзывах)
export function AdminListSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <AdminItemCardSkeleton key={i} />
      ))}
    </div>
  );
}

// Скелетон для карточки отзыва
export function AdminFeedbackCardSkeleton() {
  return (
    <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm">
      <div className="flex gap-4 mb-3">
        {/* Круглое фото автора */}
        <Skeleton className="w-14 h-14 rounded-full flex-shrink-0" />

        {/* Информация */}
        <div className="flex-1 min-w-0 space-y-2">
          <Skeleton className="h-5 w-2/5" />
          {/* Звезды и дата */}
          <div className="flex items-center gap-3">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-3 w-20" />
          </div>
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-4/5" />
        </div>
      </div>

      {/* Badges */}
      <div className="flex items-center gap-2 mb-4">
        <Skeleton className="h-6 w-32 rounded-full" />
        <Skeleton className="h-6 w-28 rounded-full" />
      </div>

      {/* Actions */}
      <div className="flex items-center justify-end pt-4 border-t border-gray-100">
        <div className="flex gap-2">
          <Skeleton className="h-8 w-8 rounded-lg" />
          <Skeleton className="h-8 w-8 rounded-lg" />
        </div>
      </div>
    </div>
  );
}

// Скелетон для сетки отзывов (2 колонки как в реальном компоненте)
export function AdminFeedbacksGridSkeleton({ count = 12 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <AdminFeedbackCardSkeleton key={i} />
      ))}
    </div>
  );
}

// Скелетон для карточки вопроса (длинная карточка на всю ширину)
export function AdminQuestionCardSkeleton() {
  return (
    <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          {/* Вопрос */}
          <Skeleton className="h-5 w-3/4 mb-2" />

          {/* Ответ */}
          <Skeleton className="h-4 w-full mb-2" />
          <Skeleton className="h-4 w-5/6 mb-3" />

          {/* Badges */}
          <div className="flex items-center gap-2">
            <Skeleton className="h-6 w-24 rounded-full" />
            <Skeleton className="h-6 w-32 rounded-full" />
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <Skeleton className="h-8 w-8 rounded-lg" />
          <Skeleton className="h-8 w-8 rounded-lg" />
        </div>
      </div>
    </div>
  );
}

// Скелетон для списка вопросов (вертикально, одна карточка в строку)
export function AdminQuestionsGridSkeleton({ count = 12 }: { count?: number }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, i) => (
        <AdminQuestionCardSkeleton key={i} />
      ))}
    </div>
  );
}

// Скелетон для страницы контактов
export function AdminContactsSkeleton() {
  return (
    <div className="bg-white rounded-2xl p-6 lg:p-8 border border-gray-100">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <Skeleton className="w-12 h-12 rounded-xl" />
        <div>
          <Skeleton className="h-7 w-40 mb-2" />
          <Skeleton className="h-4 w-64" />
        </div>
      </div>

      {/* Form fields */}
      <div className="space-y-6">
        {Array.from({ length: 7 }).map((_, i) => (
          <div key={i}>
            <Skeleton className="h-4 w-32 mb-2" />
            <Skeleton className="h-11 w-full rounded-lg" />
          </div>
        ))}

        {/* Button */}
        <div className="pt-4">
          <Skeleton className="h-11 w-48 rounded-lg" />
        </div>
      </div>
    </div>
  );
}

// Скелетон для загрузки доступа (начальная загрузка)
export function AdminAccessSkeleton() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 backdrop-blur-md">
      {/* Блюр оверлей */}
      <div className="absolute inset-0 bg-white/50 backdrop-blur-sm" />

      {/* Центральный контент */}
      <div className="relative z-10 text-center">
        {/* Анимированный спиннер */}
        <div className="mb-6">
          <div className="w-16 h-16 mx-auto border-4 border-gray-200 border-t-[#18A36C] rounded-full animate-spin" />
        </div>

        {/* Текст загрузки */}
        <div className="space-y-3">
          <h2 className="text-xl font-semibold text-gray-800">Проверка доступа...</h2>
          <p className="text-sm text-gray-500">Пожалуйста, подождите</p>
        </div>

        {/* Пульсирующие точки */}
        <div className="flex justify-center gap-2 mt-6">
          <div className="w-2 h-2 bg-[#18A36C] rounded-full animate-pulse" style={{ animationDelay: '0ms' }} />
          <div className="w-2 h-2 bg-[#18A36C] rounded-full animate-pulse" style={{ animationDelay: '150ms' }} />
          <div className="w-2 h-2 bg-[#18A36C] rounded-full animate-pulse" style={{ animationDelay: '300ms' }} />
        </div>
      </div>
    </div>
  );
}
