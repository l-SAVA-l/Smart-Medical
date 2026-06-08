'use client';

import { ClinicPage } from "@/components/SMClinic/SMClinicPage";
import { ClinicContent } from "@/components/SMClinic/SMClinicContent";
import { NavigableClinicMenu } from "@/components/SMClinic/SMNavigableClinicMenu";
import { useRouter } from "@/components/SMRouter/SMRouter";
import { usePathname } from 'next/navigation';
import { useEffect } from 'react';

export default function ClinicSubPage() {
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
    let itemId = '';
    if (pathParts[0] === 'clinic') {
        categoryId = pathParts[1] || '';
        itemId = pathParts[2] || pathParts[1] || '';
    }

    return (
        <div className="flex min-h-screen bg-gray-50">
            <NavigableClinicMenu />
            <div className="flex-1">
                {categoryId || itemId ? (
                    <ClinicPage
                        key={`${categoryId}-${itemId}`}
                        itemId={itemId}
                        categoryId={categoryId || itemId}
                    />
                ) : (
                    <ClinicContent />
                )}
            </div>
        </div>
    );
}
