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

// Скелетон для заголовка страницы
export function PageHeaderSkeleton() {
  return (
    <div className="mb-8">
      <Skeleton className="h-10 w-64 mb-4" />
      <Skeleton className="h-4 w-full mb-2" />
      <Skeleton className="h-4 w-3/4" />
    </div>
  );
}

// Скелетон для карточки партнёра
export function PartnerCardSkeleton() {
  return (
    <Card className="border border-gray-100 h-full">
      <div className="p-6 h-full flex flex-col">
        <Skeleton className="w-full h-32 rounded-lg mb-4" />
        <Skeleton className="h-6 w-3/4 mb-2" />
        <Skeleton className="h-4 w-full mb-2" />
        <Skeleton className="h-4 w-5/6 mb-4 flex-grow" />

        <div className="space-y-2 mb-4">
          <div className="flex items-center gap-2">
            <Skeleton className="w-4 h-4" />
            <Skeleton className="h-4 w-32" />
          </div>
        </div>

        <Skeleton className="h-5 w-24" />
      </div>
    </Card>
  );
}

// Скелетон для списка партнёров
export function PartnersListSkeleton() {
  return (
    <>
      <div className="p-4 lg:p-8">
        <div className="max-w-6xl mx-auto">
          <PageHeaderSkeleton />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <PartnerCardSkeleton key={i} />
            ))}
          </div>

          {/* Пагинация */}
          <div className="flex justify-center gap-2 mt-8">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="w-10 h-10 rounded" />
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

// Скелетон для страницы одного партнёра
export function SinglePartnerSkeleton() {
  return (
    <>
      <div className="p-4 lg:p-8">
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1">
              <Card className="p-6">
                <Skeleton className="w-full h-48 rounded-lg mb-4" />
                <Skeleton className="h-6 w-3/4 mb-4" />

                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <Skeleton className="w-5 h-5" />
                    <Skeleton className="h-4 w-40" />
                  </div>
                </div>
              </Card>
            </div>

            <div className="lg:col-span-2">
              <Card className="p-6">
                <Skeleton className="h-6 w-32 mb-4" />
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-5/6" />
              </Card>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

// Скелетон для карточки вакансии
export function VacancyCardSkeleton() {
  return (
    <Card className="p-6 h-full flex flex-col border-gray-200">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <Skeleton className="h-6 w-48 mb-2" />
          <Skeleton className="h-4 w-32" />
        </div>
      </div>

      <Skeleton className="h-4 w-full mb-2" />
      <Skeleton className="h-4 w-5/6 mb-4 flex-grow" />

      <div className="space-y-3 mb-4">
        <div className="flex items-center gap-2">
          <Skeleton className="w-4 h-4" />
          <Skeleton className="h-4 w-24" />
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="w-4 h-4" />
          <Skeleton className="h-4 w-32" />
        </div>
      </div>

      <div className="space-y-3">
        <div>
          <Skeleton className="h-4 w-24 mb-2" />
          <Skeleton className="h-3 w-full" />
        </div>
        <Skeleton className="h-10 w-full rounded" />
      </div>
    </Card>
  );
}

// Скелетон для списка вакансий
export function VacanciesListSkeleton() {
  return (
    <>
      <div className="p-4 lg:p-8">
        <div className="max-w-6xl mx-auto">
          <Skeleton className="h-10 w-40 mb-4 rounded" />
          <PageHeaderSkeleton />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <VacancyCardSkeleton key={i} />
            ))}
          </div>

          {/* Пагинация */}
          <div className="flex justify-center gap-2 mt-8">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="w-10 h-10 rounded" />
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

// Скелетон для страницы одной вакансии
export function SingleVacancySkeleton() {
  return (
    <>
      <div className="p-4 lg:p-8">
        <div className="max-w-4xl mx-auto">
          <Skeleton className="h-10 w-40 mb-4 rounded" />

          <Card className="p-6 lg:p-8">
            <div className="flex items-start justify-between mb-6">
              <div className="flex-1">
                <Skeleton className="h-8 w-64 mb-2" />
                <Skeleton className="h-5 w-32 mb-2" />
                <div className="flex items-center gap-4">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-32" />
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <Skeleton className="h-6 w-40 mb-3" />
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-3/4" />
              </div>

              <div>
                <Skeleton className="h-6 w-32 mb-3" />
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-5/6" />
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-gray-200">
              <div className="text-center">
                <Skeleton className="h-12 w-56 mx-auto rounded mb-3" />
                <Skeleton className="h-4 w-64 mx-auto" />
              </div>
            </div>
          </Card>
        </div>
      </div>
    </>
  );
}

// Скелетон для отзыва
export function ReviewItemSkeleton() {
  return (
    <div className="border-b border-gray-200 last:border-b-0 pb-6 last:pb-0">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <Skeleton className="w-10 h-10 rounded-full" />
          <div>
            <Skeleton className="h-5 w-32 mb-1" />
            <Skeleton className="h-4 w-24" />
          </div>
        </div>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} className="w-4 h-4 rounded" />
          ))}
        </div>
      </div>
      <Skeleton className="h-4 w-full mb-2" />
      <Skeleton className="h-4 w-5/6" />
    </div>
  );
}

// Скелетон для страницы отзывов
export function ReviewsPageSkeleton() {
  return (
    <>
      <div className="p-4 lg:p-8">
        <div className="max-w-6xl mx-auto">
          <Skeleton className="h-10 w-56 mb-4 rounded" />
          <PageHeaderSkeleton />

          <Card className="p-6">
            <div className="mb-6">
              <div className="flex items-center justify-between">
                <Skeleton className="h-6 w-40" />
                <Skeleton className="h-4 w-48" />
              </div>
            </div>

            <div className="space-y-6">
              {[1, 2, 3, 4, 5].map((i) => (
                <ReviewItemSkeleton key={i} />
              ))}
            </div>

            {/* Пагинация */}
            <div className="flex justify-center gap-2 mt-8">
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} className="w-10 h-10 rounded" />
              ))}
            </div>
          </Card>
        </div>
      </div>
    </>
  );
}

// Скелетон для FAQ
export function FAQItemSkeleton() {
  return (
    <div className="border border-gray-200 rounded-lg p-4">
      <div className="flex items-center justify-between">
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-5 w-5" />
      </div>
    </div>
  );
}

// Скелетон для страницы с FAQ
export function FAQPageSkeleton() {
  return (
    <>
      <div className="p-4 lg:p-8">
        <div className="max-w-6xl mx-auto">
          <PageHeaderSkeleton />

          <Card className="p-6 lg:p-8">
            <Skeleton className="h-6 w-56 mb-6" />
            <div className="space-y-4">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <FAQItemSkeleton key={i} />
              ))}
            </div>
          </Card>
        </div>
      </div>
    </>
  );
}

// Скелетон для дочерних элементов (категории, подразделы)
export function ChildrenGridSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <Card key={i} className="border border-gray-100">
          <div className="p-6">
            <Skeleton className="h-6 w-3/4 mb-2" />
            <Skeleton className="h-4 w-full mb-2" />
            <Skeleton className="h-4 w-5/6 mb-4" />
            <Skeleton className="h-5 w-24" />
          </div>
        </Card>
      ))}
    </div>
  );
}

// Общий скелетон для страницы клиники (по умолчанию)
export function ClinicPageSkeleton() {
  return (
    <>
      <div className="p-4 lg:p-8">
        <div className="max-w-6xl mx-auto">
          <PageHeaderSkeleton />
          <ChildrenGridSkeleton />
        </div>
      </div>
    </>
  );
}
