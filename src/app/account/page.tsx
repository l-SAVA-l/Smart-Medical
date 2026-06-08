'use client';

import { SMAccountPage } from "@/components/SMAccount/SMAccountPage";
import { AccountContent } from "@/components/SMAccount/SMAccountContent";
import { NavigableAccountMenu } from "@/components/SMAccount/SMNavigableAccountMenu";
import { useRouter } from "@/components/SMRouter/SMRouter";
import { useSession } from "next-auth/react";
import { useEffect } from "react";
import { useRouter as useNextRouter } from "next/navigation";

export default function Account() {
  const { data: session, status } = useSession();
  const { currentRoute } = useRouter();
  const nextRouter = useNextRouter();
  const pathParts = currentRoute.replace(/^\/+|\/+$/g, '').split('/');

  let sectionId = '';
  if (pathParts[0] === 'account') {
    sectionId = pathParts[1] || '';
  }

  const accountContentSections = ['appointments', 'subscriptions', 'materials', 'contact'];
  const showAccountContent = !sectionId || accountContentSections.includes(sectionId);

  // Redirect to home if not authenticated
  useEffect(() => {
    if (status === 'unauthenticated') {
      nextRouter.push('/');
    }
  }, [status, nextRouter]);

  // Show loading while checking auth
  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#18A36C]"></div>
      </div>
    );
  }

  // Don't render anything if not authenticated (will redirect)
  if (status === 'unauthenticated') {
    return null;
  }

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
