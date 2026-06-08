'use client';

import { Card, CardContent, CardHeader } from '../common/SMCard/SMCard';

// Базовый компонент скелетона
function Skeleton({ className = '' }: { className?: string }) {
  return (
    <div className={`animate-pulse bg-gray-200 rounded ${className}`} />
  );
}

// Скелетон для Welcome Hero секции
export function WelcomeHeroSkeleton() {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-8 lg:p-12 mb-12">
      <div className="flex flex-col lg:flex-row items-center gap-8">
        <div className="flex-1">
          <div className="flex flex-col lg:flex-row items-center lg:items-start gap-6">
            {/* Avatar skeleton */}
            <Skeleton className="w-20 h-20 lg:w-24 lg:h-24 rounded-full" />

            <div className="text-center lg:text-left flex-1">
              {/* Title skeleton */}
              <Skeleton className="h-10 w-64 mb-4 mx-auto lg:mx-0" />
              {/* Subtitle skeleton */}
              <Skeleton className="h-5 w-48 mx-auto lg:mx-0" />
            </div>
          </div>
        </div>

        {/* Stats Cards skeleton */}
        <div className="grid grid-cols-2 gap-6">
          <div className="bg-gray-50 rounded-lg p-6 border border-gray-200 w-24 h-24">
            <Skeleton className="h-8 w-8 mx-auto mb-2" />
            <Skeleton className="h-4 w-16 mx-auto" />
          </div>
          <div className="bg-gray-50 rounded-lg p-6 border border-gray-200 w-24 h-24">
            <Skeleton className="h-8 w-8 mx-auto mb-2" />
            <Skeleton className="h-4 w-16 mx-auto" />
          </div>
        </div>
      </div>
    </div>
  );
}

// Скелетон для карточки профиля
export function ProfileCardSkeleton() {
  return (
    <Card className="border border-gray-200 mb-12">
      <CardHeader className="border-b border-gray-200 bg-gray-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Skeleton className="w-12 h-12 rounded-lg" />
            <div>
              <Skeleton className="h-6 w-40 mb-2" />
              <Skeleton className="h-4 w-56" />
            </div>
          </div>
          <Skeleton className="h-10 w-40 rounded-md" />
        </div>
      </CardHeader>
      <CardContent className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-12 w-full rounded-lg" />
            </div>
          ))}
          <div className="space-y-2 md:col-span-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-12 w-full rounded-lg" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Скелетон для Quick Actions
export function QuickActionsSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
      {[1, 2, 3].map((i) => (
        <Card key={i} className="border border-gray-200">
          <CardContent className="p-6">
            <div className="flex items-center gap-4 mb-4">
              <Skeleton className="w-14 h-14 rounded-lg" />
              <div className="flex-1">
                <Skeleton className="h-5 w-24 mb-2" />
                <Skeleton className="h-4 w-32" />
              </div>
            </div>
            <Skeleton className="h-4 w-36" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

// Скелетон для карточки материала
export function MaterialCardSkeleton() {
  return (
    <Card className="border border-gray-200">
      <Skeleton className="w-full h-48 rounded-t-lg rounded-b-none" />
      <CardContent className="p-4">
        <Skeleton className="h-6 w-full mb-2" />
        <Skeleton className="h-4 w-full mb-1" />
        <Skeleton className="h-4 w-3/4 mb-3" />
        <div className="flex items-center justify-between">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-8 w-28 rounded-md" />
        </div>
      </CardContent>
    </Card>
  );
}

// Скелетон для секции материалов
export function MaterialsSectionSkeleton() {
  return (
    <div className="mb-12">
      <div className="flex items-center justify-between mb-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-10 w-32 rounded-md" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <MaterialCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}

// Скелетон для Profile Management карточки внизу
export function ProfileManagementSkeleton() {
  return (
    <Card className="border border-gray-200">
      <CardContent className="p-6">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <Skeleton className="w-16 h-16 rounded-full" />
            <div>
              <Skeleton className="h-6 w-40 mb-2" />
              <Skeleton className="h-4 w-48 mb-1" />
              <Skeleton className="h-4 w-32" />
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <Skeleton className="h-10 w-44 rounded-md" />
            <Skeleton className="h-10 w-36 rounded-md" />
            <Skeleton className="h-10 w-24 rounded-md" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Полный скелетон для Welcome Dashboard
export function WelcomeDashboardSkeleton() {
  return (
    <div className="max-w-7xl mx-auto px-4 lg:px-8 py-8">
      <WelcomeHeroSkeleton />
      <ProfileCardSkeleton />
      <QuickActionsSkeleton />
      <MaterialsSectionSkeleton />
      <ProfileManagementSkeleton />
    </div>
  );
}

// Скелетон для страницы подписок
export function SubscriptionsSkeleton() {
  return (
    <div className="p-4 lg:p-8 max-w-7xl mx-auto space-y-6">
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="flex items-center gap-3 mb-4">
          <Skeleton className="w-12 h-12 rounded-lg" />
          <div>
            <Skeleton className="h-6 w-40 mb-2" />
            <Skeleton className="h-4 w-64" />
          </div>
        </div>
      </div>

      <Card className="border border-gray-200">
        <CardContent className="p-6 space-y-6">
          <div className="space-y-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-10 w-full rounded-md" />
          </div>

          <div className="space-y-3">
            <Skeleton className="h-4 w-32" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="flex items-center gap-2">
                  <Skeleton className="w-5 h-5 rounded" />
                  <Skeleton className="h-4 w-32" />
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-10 w-48 rounded-md" />
          </div>

          <div className="flex gap-4">
            <Skeleton className="h-10 w-28 rounded-md" />
            <Skeleton className="h-10 w-24 rounded-md" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Скелетон для страницы материалов
export function MaterialsPageSkeleton() {
  return (
    <div className="p-4 lg:p-8 max-w-7xl mx-auto space-y-6">
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="flex items-center gap-3 mb-4">
          <Skeleton className="w-12 h-12 rounded-lg" />
          <div>
            <Skeleton className="h-6 w-32 mb-2" />
            <Skeleton className="h-4 w-56" />
          </div>
        </div>
      </div>

      <div className="flex gap-4 items-center">
        <Skeleton className="h-4 w-16" />
        <Skeleton className="h-10 w-48 rounded-md" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <MaterialCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}

// Скелетон для страницы контактов
export function ContactSkeleton() {
  return (
    <div className="p-4 lg:p-8 max-w-7xl mx-auto space-y-6">
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="flex items-center gap-3 mb-4">
          <Skeleton className="w-12 h-12 rounded-lg" />
          <div>
            <Skeleton className="h-6 w-44 mb-2" />
            <Skeleton className="h-4 w-48" />
          </div>
        </div>
      </div>

      <Card className="border border-gray-200">
        <CardContent className="p-6 space-y-6">
          <Skeleton className="h-16 w-full rounded-lg" />

          <div className="space-y-4">
            <div className="space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-10 w-full rounded-md" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-10 w-full rounded-md" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-32 w-full rounded-md" />
            </div>
          </div>

          <Skeleton className="h-10 w-32 rounded-md" />
        </CardContent>
      </Card>
    </div>
  );
}
