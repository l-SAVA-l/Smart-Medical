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

// Скелетон для карточки специалиста в списке
export function SpecialistCardSkeleton() {
  return (
    <Card className="p-6 border border-gray-200 rounded-lg">
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Avatar */}
        <div className="flex-shrink-0 mx-auto sm:mx-0">
          <Skeleton className="w-24 h-24 rounded-lg" />
        </div>

        {/* Info */}
        <div className="flex-1 text-center sm:text-left">
          <Skeleton className="h-6 w-48 mb-2 mx-auto sm:mx-0" />
          <Skeleton className="h-4 w-32 mb-2 mx-auto sm:mx-0" />

          <div className="space-y-1 mb-3">
            <Skeleton className="h-4 w-40 mx-auto sm:mx-0" />
            <Skeleton className="h-4 w-28 mx-auto sm:mx-0" />
          </div>

          {/* Stars */}
          <div className="flex items-center gap-1 justify-center sm:justify-start mb-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} className="w-4 h-4 rounded" />
            ))}
            <Skeleton className="h-4 w-10 ml-1" />
          </div>

          {/* Button */}
          <Skeleton className="h-12 w-full sm:w-40 rounded-lg" />
        </div>
      </div>
    </Card>
  );
}

// Скелетон для списка специалистов
export function SpecialistsListSkeleton() {
  return (
    <div className="p-4 lg:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="mb-6">
            <Skeleton className="h-10 w-48 mb-2" />
            <Skeleton className="h-5 w-32" />
          </div>
        </div>

        {/* Grid of cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <SpecialistCardSkeleton key={i} />
          ))}
        </div>
      </div>
    </div>
  );
}

// Скелетон для секции информации на странице специалиста
export function InfoSectionSkeleton() {
  return (
    <Card className="p-6">
      <div className="flex items-center gap-3 mb-4">
        <Skeleton className="w-10 h-10 rounded-full" />
        <Skeleton className="h-6 w-48" />
      </div>
      <div className="space-y-2">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex items-center gap-2">
            <Skeleton className="w-2 h-2 rounded-full" />
            <Skeleton className="h-4 w-full max-w-md" />
          </div>
        ))}
      </div>
    </Card>
  );
}

// Скелетон для страницы одного специалиста
export function DoctorPageSkeleton() {
  return (
    <>
      <div className="p-4 lg:p-8">
        <div className="max-w-6xl mx-auto">
          {/* Main card */}
          <div className="mb-8">
            <div className="bg-white rounded-lg border border-gray-200 p-6 lg:p-8">
              <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
                {/* Avatar */}
                <div className="flex-shrink-0 mx-auto lg:mx-0">
                  <Skeleton className="w-32 h-32 lg:w-40 lg:h-40 rounded-lg" />
                </div>

                {/* Info */}
                <div className="flex-1 text-center lg:text-left">
                  <div className="mb-4">
                    <Skeleton className="h-10 w-64 mb-2 mx-auto lg:mx-0" />
                    <Skeleton className="h-6 w-48 mb-3 mx-auto lg:mx-0" />

                    <div className="space-y-1 mb-4">
                      <Skeleton className="h-5 w-40 mx-auto lg:mx-0" />
                      <Skeleton className="h-5 w-32 mx-auto lg:mx-0" />
                    </div>

                    {/* Stars */}
                    <div className="flex items-center gap-1 justify-center lg:justify-start mb-6">
                      {[1, 2, 3, 4, 5].map((i) => (
                        <Skeleton key={i} className="w-5 h-5 rounded" />
                      ))}
                      <Skeleton className="h-5 w-12 ml-2" />
                    </div>
                  </div>

                  {/* Booking section */}
                  <div className="bg-gray-100 rounded-lg p-6">
                    <Skeleton className="h-6 w-40 mb-3" />
                    <Skeleton className="h-14 w-full lg:w-56 rounded-lg" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Info sections */}
          <div className="space-y-6">
            <InfoSectionSkeleton />
            <InfoSectionSkeleton />
            <InfoSectionSkeleton />
          </div>
        </div>
      </div>
    </>
  );
}
