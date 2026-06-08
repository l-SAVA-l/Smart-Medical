'use client';

import { SMAccountPage } from "@/components/SMAccount/SMAccountPage";
import { AccountContent } from "@/components/SMAccount/SMAccountContent";
import { NavigableAccountMenu } from "@/components/SMAccount/SMNavigableAccountMenu";
import { useRouter } from "@/components/SMRouter/SMRouter";
import { usePathname } from 'next/navigation';
import { useEffect } from 'react';

export default function AccountSubPage() {
  const { currentRoute, navigate } = useRouter();
  const pathname = usePathname();

  // Синхронизируем Next.js pathname с SMRouter при изменении pathname
  useEffect(() => {
    if (pathname && pathname !== currentRoute) {
      navigate(pathname);
    }
  }, [pathname]);

  const pathParts = currentRoute.replace(/^\/+|\/+$/g, '').split('/');

  let sectionId = '';
  if (pathParts[0] === 'account') {
    sectionId = pathParts[1] || '';
  }

  const accountContentSections = ['appointments', 'subscriptions', 'materials', 'contact'];
  const showAccountContent = !sectionId || accountContentSections.includes(sectionId);

  return (
    <div className="flex min-h-screen">
      <NavigableAccountMenu />
      <div className="flex-1">
        {showAccountContent ? (
          <AccountContent />
        ) : (
          <SMAccountPage />
        )}
      </div>
    </div>
  );
}
