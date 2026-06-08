'use client';

import React from 'react';
import { ServicePage } from '../../page';
import { NavigableServicesMenu } from '@/components/SMServices/SMNavigableServicesMenu';
import { ServicePageSkeleton } from '@/components/SMServices/SMServicesSkeleton';
import { usePathname } from 'next/navigation';

interface PageProps {
  params: Promise<{
    categorySlug: string;
    serviceId: string;
  }>;
}

export default function ServiceDetailPage({ params }: PageProps) {
  const pathname = usePathname();
  const [resolvedParams, setResolvedParams] = React.useState<{
    categorySlug: string;
    serviceId: string;
  } | null>(null);

  // Parse params from pathname for dynamic updates
  React.useEffect(() => {
    const routeParts = pathname.split('/').filter(Boolean);
    if (routeParts[0] === 'services' && routeParts.length >= 3) {
      setResolvedParams({
        categorySlug: routeParts[1],
        serviceId: routeParts[2]
      });
    } else {
      // Fallback to Next.js params for initial load
      params.then(setResolvedParams);
    }
  }, [pathname, params]);

  return (
    <div className="flex min-h-screen bg-gray-50">
      <NavigableServicesMenu />
      <div className="flex-1">
        {!resolvedParams ? (
          <ServicePageSkeleton />
        ) : (
          <ServicePage
            key={`${resolvedParams.categorySlug}-${resolvedParams.serviceId}`}
            categoryId={resolvedParams.categorySlug}
            serviceId={resolvedParams.serviceId}
          />
        )}
      </div>
    </div>
  );
}
