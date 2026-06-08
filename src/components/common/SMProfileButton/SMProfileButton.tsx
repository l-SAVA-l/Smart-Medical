'use client';

import React, { useState, useEffect } from 'react';
import { useSession, signIn, signOut } from 'next-auth/react';
import { useRouter, usePathname } from 'next/navigation';
import { Button } from '../SMButton/SMButton';
import { User, Shield } from 'lucide-react';

interface SMProfileButtonProps {
  className?: string;
  onAuthModalOpen?: (type?: 'login' | 'register' | 'forgot-password') => void;
}

// Скелетон для кнопки профиля
function ProfileButtonSkeleton({ className }: { className?: string }) {
  return (
    <div className={`flex items-center gap-2 px-2 lg:px-3 py-2 ${className || ''}`}>
      <div className="w-4 h-4 animate-pulse bg-gray-200 rounded" />
      <div className="w-16 h-4 animate-pulse bg-gray-200 rounded" />
    </div>
  );
}

export const SMProfileButton: React.FC<SMProfileButtonProps> = ({ className, onAuthModalOpen }) => {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const [isAdmin, setIsAdmin] = useState(false);

  // Check if user is admin or chief doctor
  useEffect(() => {
    if (session) {
      fetch('/api/admin/auth')
        .then(res => res.json())
        .then(data => setIsAdmin(data.isAdmin))
        .catch(() => setIsAdmin(false));
    } else {
      setIsAdmin(false);
    }
  }, [session]);

  const handleClick = () => {
    if (!session) {
      if (onAuthModalOpen) {
        onAuthModalOpen('login');
      } else {
        signIn('google', {
          callbackUrl: '/account',
          redirect: true,
        });
      }
    } else {
      // Если пользователь уже на странице аккаунта, не делаем ничего
      if (pathname?.startsWith('/account')) {
        return;
      }
      router.push('/account');
    }
  };

  // Показываем скелетон пока сессия загружается
  if (status === 'loading') {
    return <ProfileButtonSkeleton className={className} />;
  }

  return (
    <div className="flex items-center gap-1">
      {/* Admin shield button */}
      {session && isAdmin && (
        <Button
          onClick={() => router.push('/admin')}
          variant="ghost"
          size="sm"
          className="text-[#18A36C] hover:bg-[#18A36C]/10 p-2 cursor-pointer"
          title="Админ-панель"
        >
          <Shield className="w-4 h-4" />
        </Button>
      )}

      {/* Profile/Login button */}
      {status === 'unauthenticated' && (
        <Button
          onClick={handleClick}
          variant="ghost"
          size="sm"
          className={`text-[#18A36C] hover:bg-[#18A36C]/10 flex items-center gap-2 px-2 lg:px-3 py-2 text-sm cursor-pointer ${className || ''}`}
        >
          <span>Авторизация</span>
        </Button>
      )}

      {/* My account button (when logged in) */}
      {status === 'authenticated' && session && (
        <Button
          onClick={handleClick}
          variant="ghost"
          size="sm"
          className={`text-[#18A36C] hover:bg-[#18A36C]/10 flex items-center gap-2 px-2 lg:px-3 py-2 text-sm cursor-pointer ${className || ''}`}
        >
          <User className="w-4 h-4" />
          <span>Мой кабинет</span>
        </Button>
      )}
    </div>
  );
};
