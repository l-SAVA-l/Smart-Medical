'use client';

import { Card } from '../common/SMCard/SMCard';

// Базовый компонент скелетона
function Skeleton({ className = '' }: { className?: string }) {
  return (
    <div className={`animate-pulse bg-gray-200 rounded ${className}`} />
  );
}

// Скелетон для хлебных крошек
export function BreadcrumbSkeleton() {
  return (
    <div className="flex items-center gap-2 py-4 px-4">
      <Skeleton className="h-4 w-16" />
      <Skeleton className="h-4 w-4" />
      <Skeleton className="h-4 w-24" />
      <Skeleton className="h-4 w-4" />
      <Skeleton className="h-4 w-32" />
    </div>
  );
}

// Скелетон для героя услуги
export function ServiceHeroSkeleton() {
  return (
    <div className="bg-white rounded-lg shadow-sm p-6 lg:p-8 border border-gray-100">
      <div className="mb-4">
        <div className="flex items-center justify-between mb-3">
          <Skeleton className="h-6 w-32 rounded-full" />
          <Skeleton className="h-8 w-24 rounded-full" />
        </div>
        <Skeleton className="h-10 w-3/4 mb-4" />
        <Skeleton className="h-4 w-full mb-2" />
        <Skeleton className="h-4 w-5/6" />
      </div>

      <Skeleton className="w-full h-64 lg:h-80 rounded-lg" />
    </div>
  );
}

// Скелетон для табов
export function ServiceTabsSkeleton() {
  return (
    <Card className="overflow-hidden border border-gray-100">
      {/* Заголовки табов */}
      <div className="border-b border-gray-200 p-2">
        <div className="grid grid-cols-3 gap-2">
          <Skeleton className="h-12 rounded-lg" />
          <Skeleton className="h-12 rounded-lg" />
          <Skeleton className="h-12 rounded-lg" />
        </div>
      </div>

      {/* Контент таба */}
      <div className="p-6 lg:p-8">
        <div className="space-y-6">
          {/* Текст описания */}
          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
            <Skeleton className="h-4 w-4/6" />
          </div>

          {/* Видео placeholder */}
          <Skeleton className="w-full h-64 rounded-lg" />

          {/* Галерея */}
          <div>
            <Skeleton className="h-6 w-32 mb-4" />
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
              <Skeleton className="aspect-square rounded-lg" />
              <Skeleton className="aspect-square rounded-lg" />
              <Skeleton className="aspect-square rounded-lg" />
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}

// Скелетон для карточки врача
export function DoctorCardSkeleton() {
  return (
    <Card className="p-8 border border-gray-100">
      <div className="mb-6">
        <div className="w-28 h-28 mx-auto">
          <Skeleton className="w-full h-full rounded-full" />
        </div>
      </div>

      <div className="text-center mb-6">
        <Skeleton className="h-6 w-48 mx-auto mb-2" />
        <Skeleton className="h-4 w-32 mx-auto mb-3" />

        <Skeleton className="h-8 w-40 mx-auto rounded-lg mb-4" />

        <div className="flex justify-center gap-1 mb-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} className="w-4 h-4 rounded" />
          ))}
        </div>
      </div>

      <div className="text-center">
        <Skeleton className="h-12 w-48 mx-auto rounded-lg" />
      </div>
    </Card>
  );
}

// Скелетон для секции врачей
export function DoctorsSectionSkeleton() {
  return (
    <Card className="p-6 lg:p-8 border border-gray-100">
      <div className="text-center mb-8">
        <Skeleton className="h-8 w-48 mx-auto mb-2" />
        <Skeleton className="h-4 w-64 mx-auto" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <DoctorCardSkeleton />
        <DoctorCardSkeleton />
      </div>
    </Card>
  );
}

// Скелетон для FAQ
export function FAQSkeleton() {
  return (
    <div className="space-y-4">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="border border-gray-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <Skeleton className="h-5 w-3/4" />
            <Skeleton className="h-5 w-5" />
          </div>
        </div>
      ))}
    </div>
  );
}

// Скелетон для отзывов
export function ReviewsSkeleton() {
  return (
    <div className="space-y-6">
      {[1, 2, 3].map((i) => (
        <div key={i} className="border-b border-gray-200 last:border-b-0 pb-6 last:pb-0">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <Skeleton className="w-10 h-10 rounded-full" />
              <div>
                <Skeleton className="h-5 w-32 mb-1" />
                <Skeleton className="h-4 w-24" />
              </div>
            </div>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((j) => (
                <Skeleton key={j} className="w-4 h-4 rounded" />
              ))}
            </div>
          </div>
          <Skeleton className="h-4 w-full mb-2" />
          <Skeleton className="h-4 w-5/6" />
        </div>
      ))}

      <div className="text-center pt-6">
        <Skeleton className="h-10 w-48 mx-auto rounded-md" />
      </div>
    </div>
  );
}

// Полный скелетон для страницы услуги
export function ServicePageSkeleton() {
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-6xl mx-auto px-4 py-6 lg:py-8">
        <div className="space-y-6">
          <ServiceHeroSkeleton />
          <ServiceTabsSkeleton />
          <DoctorsSectionSkeleton />

          {/* Footer секция */}
          <div className="p-6 bg-gray-50 rounded-2xl border border-gray-100">
            <div className="text-center">
              <Skeleton className="w-12 h-12 rounded-full mx-auto mb-3" />
              <Skeleton className="h-5 w-64 mx-auto mb-2" />
              <Skeleton className="h-4 w-80 mx-auto mb-4" />
              <Skeleton className="h-12 w-40 mx-auto rounded-lg" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
