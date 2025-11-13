'use client';

import React from 'react';
import { DoctorPage } from "@/components/SMDoctor/SMDoctorPage";
import { NavigableDoctorsMenu } from "@/components/SMDoctor/SMNavigableDoctorsMenu";

export default function DoctorDetailPage({
  params,
}: {
  params: Promise<{ categorySlug: string; doctorId: string }>;
}) {
  const [resolvedParams, setResolvedParams] = React.useState<{ categorySlug: string; doctorId: string } | null>(null);

  React.useEffect(() => {
    params.then(setResolvedParams);
  }, [params]);

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
        <DoctorPage doctorId={resolvedParams.doctorId} categorySlug={resolvedParams.categorySlug} />
      </div>
    </div>
  );
}

