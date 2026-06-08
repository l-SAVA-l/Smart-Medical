'use client';

import { DoctorPage } from "@/components/SMDoctor/SMDoctorPage";
import { DoctorsContent } from "@/components/SMDoctor/SMDoctorContent";
import { NavigableDoctorsMenu } from "@/components/SMDoctor/SMNavigableDoctorsMenu";
import { useRouter } from "@/components/SMRouter/SMRouter";
import { usePathname } from 'next/navigation';
import { useEffect } from 'react';

export default function Doctors() {
    const { currentRoute, navigate } = useRouter();
    const pathname = usePathname();

    // Синхронизируем Next.js pathname с SMRouter при изменении pathname
    useEffect(() => {
        if (pathname && pathname !== currentRoute) {
            navigate(pathname);
        }
    }, [pathname]);

    const pathParts = currentRoute.replace(/^\/+|\/+$/g, '').split('/');

    let categoryId = '';
    let doctorId = '';
    if (pathParts[0] === 'doctors') {
        categoryId = pathParts[1] || '';
        doctorId = pathParts[2] || '';
    }

    return (
        <div className="flex min-h-screen bg-gray-50">
            <NavigableDoctorsMenu />
            <div className="flex-1">
                {categoryId && doctorId ? (
                    <DoctorPage doctorId={doctorId} categorySlug={categoryId} />
                ) : (
                    <DoctorsContent />
                )}
            </div>
        </div>
    );
}