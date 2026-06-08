'use client';

import React from 'react';
import { DoctorPage } from "@/components/SMDoctor/SMDoctorPage";
import { NavigableDoctorsMenu } from "@/components/SMDoctor/SMNavigableDoctorsMenu";
import { useRouter } from "@/components/SMRouter/SMRouter";

export default function DoctorDetailPage({
  params,
}: {
  params: Promise<{ categorySlug: string; doctorId: string }>;
}) {
  const { currentRoute } = useRouter();
  const [resolvedParams, setResolvedParams] = React.useState<{ categorySlug: string; doctorId: string } | null>(null);

  // Parse params from currentRoute (SMRouter) for dynamic updates
  React.useEffect(() => {
    const routeParts = currentRoute.split('/').filter(Boolean);
    if (routeParts[0] === 'doctors' && routeParts.length >= 3) {
      setResolvedParams({
        categorySlug: routeParts[1],
        doctorId: routeParts[2]
      });
    } else {
      // Fallback to Next.js params for initial load
      params.then(setResolvedParams);
    }
  }, [currentRoute, params]);

  if (!resolvedParams) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <NavigableDoctorsMenu />
        <div className="flex-1 p-8">Загрузка...</div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <NavigableDoctorsMenu />
      <div className="flex-1">
        <DoctorPage
          key={`${resolvedParams.categorySlug}-${resolvedParams.doctorId}`}
          doctorId={resolvedParams.doctorId}
          categorySlug={resolvedParams.categorySlug}
        />
      </div>
    </div>
  );
}

