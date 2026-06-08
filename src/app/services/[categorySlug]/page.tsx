'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card } from '@/components/common/SMCard/SMCard';
import { iconMap, IconName } from '@/utils/iconMapper';
import { NavigableServicesMenu } from '@/components/SMServices/SMNavigableServicesMenu';

// Skeleton components
function CategoryCardSkeleton() {
  return (
    <div className="group relative bg-white rounded-2xl border border-gray-200 p-6 animate-pulse">
      <div className="flex items-start gap-4 mb-4">
        <div className="flex-shrink-0 w-16 h-16 bg-gray-200 rounded-xl" />
        <div className="flex-1 min-w-0 space-y-2">
          <div className="h-5 bg-gray-200 rounded w-3/4" />
          <div className="h-4 bg-gray-200 rounded w-1/2" />
        </div>
      </div>
      <div className="space-y-2">
        <div className="h-3 bg-gray-200 rounded w-full" />
        <div className="h-3 bg-gray-200 rounded w-5/6" />
      </div>
    </div>
  );
}

function ServiceCardSkeleton() {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden animate-pulse">
      <div className="relative h-48 bg-gray-200" />
      <div className="p-6 space-y-3">
        <div className="h-5 bg-gray-200 rounded w-4/5" />
        <div className="h-4 bg-gray-200 rounded w-2/3" />
        <div className="space-y-2">
          <div className="h-3 bg-gray-200 rounded w-full" />
          <div className="h-3 bg-gray-200 rounded w-5/6" />
          <div className="h-3 bg-gray-200 rounded w-4/5" />
        </div>
      </div>
    </div>
  );
}

interface MenuItem {
  id: string;
  title: string;
  icon?: string;
  description?: string;
  children?: MenuItem[];
}

interface ServiceCategory {
  id: string;
  name: string;
  slug: string;
  icon: string | null;
  description: string | null;
  children?: ServiceCategory[];
}

interface Service {
  id: number;
  title: string;
  subtitle: string;
  price: number;
  description: string;
  image_url: string;
  video_url: string;
}

export default function CategoryPage() {
  const params = useParams();
  const router = useRouter();
  const categorySlug = params.categorySlug as string;

  const [category, setCategory] = useState<ServiceCategory | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadCategoryAndServices() {
      setLoading(true);

      try {
        // Загружаем структуру меню из API
        const menuResponse = await fetch('/api/services-menu');
        if (!menuResponse.ok) {
          setCategory(null);
          setLoading(false);
          return;
        }

        const menuData = await menuResponse.json();

        // Поиск категории в динамических данных
        const findCategory = (items: MenuItem[], slug: string): MenuItem | null => {
          for (const item of items) {
            if (item.id === slug) {
              return item;
            }
            if (item.children) {
              const found = findCategory(item.children, slug);
              if (found) return found;
            }
          }
          return null;
        };

        const foundCategory = findCategory(menuData.menuData, categorySlug);

        if (!foundCategory) {
          setCategory(null);
          setLoading(false);
          return;
        }

        // Трансформируем в нужный формат
        const transformedCategory: ServiceCategory = {
          id: foundCategory.id,
          name: foundCategory.title,
          slug: foundCategory.id,
          icon: foundCategory.icon || null,
          description: foundCategory.description || null,
          children: foundCategory.children?.map(child => ({
            id: child.id,
            name: child.title,
            slug: child.id,
            icon: child.icon || null,
            description: child.description || null,
            children: child.children?.map(subChild => ({
              id: subChild.id,
              name: subChild.title,
              slug: subChild.id,
              icon: subChild.icon || null,
              description: subChild.description || null,
            }))
          }))
        };

        // Загружаем услуги из БД для этой категории
        let loadedServices: Service[] = [];
        try {
          const response = await fetch(`/api/service-categories/${categorySlug}`);
          if (response.ok) {
            const apiData = await response.json();
            if (apiData.services && apiData.services.length > 0) {
              loadedServices = apiData.services;
            }
          }
        } catch (error) {
          console.error('Error loading services:', error);
        }

        // Если есть ровно одна услуга - редиректим сразу на неё
        if (loadedServices.length === 1) {
          router.push(`/services/${categorySlug}/${loadedServices[0].id}`);
          return;
        }

        setCategory(transformedCategory);
        setServices(loadedServices);
        setLoading(false);
      } catch (error) {
        console.error('Error loading category:', error);
        setCategory(null);
        setLoading(false);
      }
    }

    if (categorySlug) {
      loadCategoryAndServices();
    }
  }, [categorySlug, router]);

  // Показываем лоадер во время загрузки
  if (loading) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <NavigableServicesMenu />
        <div className="flex-1">
          <div className="p-4 lg:p-8">
            <div className="max-w-4xl mx-auto">
              {/* Header skeleton */}
              <div className="mb-8 lg:mb-12">
                <div className="text-center mb-6 lg:mb-8 animate-pulse">
                  <div className="w-16 h-16 bg-gray-200 rounded-lg mx-auto mb-4" />
                  <div className="h-8 bg-gray-200 rounded w-1/2 mx-auto mb-3" />
                  <div className="h-4 bg-gray-200 rounded w-3/4 mx-auto" />
                </div>
              </div>

              {/* Cards skeleton */}
              <div className="mb-8">
                <div className="h-7 bg-gray-200 rounded w-32 mb-6 animate-pulse" />
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <CategoryCardSkeleton />
                  <CategoryCardSkeleton />
                  <CategoryCardSkeleton />
                  <ServiceCardSkeleton />
                  <ServiceCardSkeleton />
                  <ServiceCardSkeleton />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Если категория не найдена
  if (!category) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <NavigableServicesMenu />
        <div className="flex-1">
          <div className="p-4 lg:p-8">
            <div className="max-w-4xl mx-auto">
              <div className="text-center bg-white border border-[#E8E6E3] rounded-lg p-8 lg:p-12">
                <h1 className="text-2xl text-[#2E2E2E] mb-4">Категория не найдена</h1>
                <p className="text-gray-600 mb-6">
                  Категория "{categorySlug}" временно недоступна или находится в разработке
                </p>
                <p className="text-sm text-gray-500">
                  Для получения информации свяжитесь с нами по телефону или через форму обратной связи
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const Icon = category.icon ? iconMap[category.icon as IconName] : null;
  const hasServices = services && services.length > 0;

  return (
    <div className="flex min-h-screen bg-gray-50">
      <NavigableServicesMenu />
      <div className="flex-1">
        <div className="p-4 lg:p-8">
          <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="mb-8 lg:mb-12">
              <div className="text-center mb-6 lg:mb-8">
                {Icon && (
                  <div className="w-16 h-16 bg-[#18A36C] rounded-lg flex items-center justify-center mx-auto mb-4">
                    <Icon className="w-8 h-8 text-white" />
                  </div>
                )}
                <h1 className="text-2xl lg:text-3xl text-[#2E2E2E] mb-3 lg:mb-4">
                  {category.name}
                </h1>
                {category.description && (
                  <p className="text-gray-600 leading-relaxed text-sm lg:text-base">
                    {category.description}
                  </p>
                )}
              </div>
            </div>

            {/* Services from database */}
            {hasServices && (
              <div>
                <h2 className="text-xl lg:text-2xl text-[#2E2E2E] mb-6">Услуги</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {services.map((service) => (
                    <Card
                      key={service.id}
                      className="group hover:shadow-xl transition-all duration-300 border border-gray-200 hover:border-[#18A36C] cursor-pointer overflow-hidden"
                      onClick={() => router.push(`/services/${categorySlug}/${service.id}`)}
                    >
                      {/* Image */}
                      {service.image_url && (
                        <div className="relative h-48 overflow-hidden">
                          <img
                            src={service.image_url}
                            alt={service.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                          <div className="absolute top-3 right-3 bg-[#18A36C] text-white px-3 py-1 rounded-full text-sm font-medium">
                            {service.price.toLocaleString('ru-RU')} ₽
                          </div>
                        </div>
                      )}

                      {/* Content */}
                      <div className="p-6">
                        <h3 className="text-lg font-semibold text-[#2E2E2E] mb-2 group-hover:text-[#18A36C] transition-colors duration-300">
                          {service.title}
                        </h3>
                        {service.subtitle && (
                          <p className="text-sm text-gray-500 mb-3">{service.subtitle}</p>
                        )}
                        {service.description && (
                          <p className="text-sm text-gray-600 leading-relaxed line-clamp-3">
                            {service.description}
                          </p>
                        )}
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* Empty state - only show if no services */}
            {!hasServices && (
              <div className="text-center bg-white border border-[#E8E6E3] rounded-lg p-8 lg:p-12">
                <p className="text-gray-600 mb-4">
                  Услуги в этой категории скоро появятся
                </p>
                <p className="text-sm text-gray-500">
                  Для получения информации свяжитесь с нами по телефону или через форму обратной связи
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
