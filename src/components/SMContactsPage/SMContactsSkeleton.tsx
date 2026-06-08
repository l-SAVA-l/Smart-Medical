'use client';

// Базовый компонент скелетона
function Skeleton({ className = '' }: { className?: string }) {
  return (
    <div className={`animate-pulse bg-gray-200 rounded ${className}`} />
  );
}

// Скелетон для заголовка страницы
export function ContactsHeaderSkeleton() {
  return (
    <div className="bg-gray-200 rounded-lg p-8 lg:p-12 mb-10 lg:mb-12">
      <div className="animate-pulse">
        <Skeleton className="w-20 h-20 rounded-lg mx-auto mb-6 bg-gray-300" />
        <Skeleton className="h-10 w-64 mx-auto mb-4 bg-gray-300" />
        <Skeleton className="h-4 w-96 max-w-full mx-auto bg-gray-300" />
      </div>
    </div>
  );
}

// Скелетон для карточки контактной информации
export function ContactCardSkeleton() {
  return (
    <div className="bg-white rounded-lg p-6 border border-gray-200">
      <div className="flex items-start gap-4">
        <Skeleton className="w-12 h-12 rounded-lg flex-shrink-0" />
        <div className="flex-1">
          <Skeleton className="h-6 w-32 mb-2" />
          <Skeleton className="h-4 w-full mb-1" />
          <Skeleton className="h-4 w-3/4" />
        </div>
      </div>
    </div>
  );
}

// Скелетон для карточки с часами работы
export function WorkingHoursCardSkeleton() {
  return (
    <div className="bg-white rounded-lg p-6 border border-gray-200">
      <div className="flex items-start gap-4">
        <Skeleton className="w-12 h-12 rounded-lg flex-shrink-0" />
        <div className="flex-1">
          <Skeleton className="h-6 w-32 mb-3" />
          <div className="space-y-2">
            <div className="flex justify-between">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-24" />
            </div>
            <div className="flex justify-between">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-24" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Скелетон для карточки телефонов
export function PhonesCardSkeleton() {
  return (
    <div className="bg-white rounded-lg p-6 border border-gray-200">
      <div className="flex items-start gap-4">
        <Skeleton className="w-12 h-12 rounded-lg flex-shrink-0" />
        <div className="flex-1">
          <Skeleton className="h-6 w-24 mb-3" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-4 w-40" />
          </div>
        </div>
      </div>
    </div>
  );
}

// Скелетон для кнопок действий
export function ActionButtonsSkeleton() {
  return (
    <div className="bg-white rounded-lg p-6 border border-gray-200 text-center">
      <Skeleton className="h-6 w-48 mx-auto mb-4" />
      <div className="flex flex-col sm:flex-row gap-4">
        <Skeleton className="h-14 flex-1 rounded-lg" />
        <Skeleton className="h-14 flex-1 rounded-lg" />
      </div>
    </div>
  );
}

// Скелетон для карты
export function MapSkeleton() {
  return (
    <div className="bg-white rounded-lg p-6 border border-gray-200">
      <Skeleton className="h-6 w-32 mb-4" />
      <Skeleton className="h-[400px] w-full rounded-lg" />
      <Skeleton className="h-3 w-64 mx-auto mt-3" />
    </div>
  );
}

// Скелетон для дополнительной информации
export function AdditionalInfoSkeleton() {
  return (
    <div className="bg-white rounded-lg p-6 lg:p-8 border border-gray-200">
      <div className="text-center max-w-2xl mx-auto">
        <Skeleton className="h-6 w-48 mx-auto mb-4" />
        <Skeleton className="h-4 w-full mb-2" />
        <Skeleton className="h-4 w-5/6 mx-auto" />
      </div>
    </div>
  );
}

// Полный скелетон для страницы контактов
export function ContactsPageSkeleton() {
  return (
    <div className="container mx-auto px-4 py-8 lg:py-12 max-w-7xl">
      {/* Header */}
      <ContactsHeaderSkeleton />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
        {/* Contact Information */}
        <div className="space-y-6">
          <ContactCardSkeleton />
          <WorkingHoursCardSkeleton />
          <PhonesCardSkeleton />
          <ContactCardSkeleton />
          <ActionButtonsSkeleton />
        </div>

        {/* Map */}
        <MapSkeleton />
      </div>

      {/* Additional Information */}
      <div className="mt-6 lg:mt-10">
        <AdditionalInfoSkeleton />
      </div>
    </div>
  );
}
