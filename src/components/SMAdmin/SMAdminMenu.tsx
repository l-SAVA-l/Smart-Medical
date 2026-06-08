'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { usePathname } from 'next/navigation';
import { Shield, Users, ChevronRight, Home, FileText, Handshake, Briefcase, HelpCircle, MessageSquare, ShoppingBag, Phone, Mail, UserCog, MessagesSquare, FolderTree, Calendar } from 'lucide-react';
import { Button } from '../common/SMButton/SMButton';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetTrigger } from '../common/SMSheet/SMSheet';
import { useUnreadCountsContext } from '@/contexts/UnreadCountsContext';

interface MenuItem {
  id: string;
  title: string;
  icon: React.ReactNode;
  href: string;
  chiefDoctorOnly?: boolean; // Only visible to CHIEF_DOCTOR
  operatorAccess?: boolean;  // Visible to OPERATOR, ADMIN, CHIEF_DOCTOR
}

const allMenuItems: MenuItem[] = [
  {
    id: 'chat',
    title: 'Чат',
    icon: <MessagesSquare className="w-4 h-4" />,
    href: '/admin/chat',
    operatorAccess: true,
  },
  {
    id: 'specialists',
    title: 'Специалисты',
    icon: <Users className="w-4 h-4" />,
    href: '/admin',
  },
  {
    id: 'services',
    title: 'Услуги',
    icon: <ShoppingBag className="w-4 h-4" />,
    href: '/admin/services',
  },
  {
    id: 'service-categories',
    title: 'Категории услуг',
    icon: <FolderTree className="w-4 h-4" />,
    href: '/admin/service-categories',
  },
  {
    id: 'materials',
    title: 'Материалы',
    icon: <FileText className="w-4 h-4" />,
    href: '/admin/materials',
  },
  {
    id: 'partners',
    title: 'Партнёры',
    icon: <Handshake className="w-4 h-4" />,
    href: '/admin/partners',
  },
  {
    id: 'vacancies',
    title: 'Вакансии',
    icon: <Briefcase className="w-4 h-4" />,
    href: '/admin/vacancies',
  },
  {
    id: 'questions',
    title: 'Вопросы (FAQ)',
    icon: <HelpCircle className="w-4 h-4" />,
    href: '/admin/questions',
  },
  {
    id: 'question-categories',
    title: 'Категории вопросов',
    icon: <FolderTree className="w-4 h-4" />,
    href: '/admin/question-categories',
  },
  {
    id: 'appointments',
    title: 'Записи',
    icon: <Calendar className="w-4 h-4" />,
    href: '/admin/appointments',
  },
  {
    id: 'feedbacks',
    title: 'Отзывы',
    icon: <MessageSquare className="w-4 h-4" />,
    href: '/admin/feedbacks',
  },
  {
    id: 'contacts',
    title: 'Контакты',
    icon: <Phone className="w-4 h-4" />,
    href: '/admin/contacts',
  },
  {
    id: 'letters',
    title: 'Письма',
    icon: <Mail className="w-4 h-4" />,
    href: '/admin/letters',
    chiefDoctorOnly: true,
  },
  {
    id: 'users',
    title: 'Пользователи',
    icon: <UserCog className="w-4 h-4" />,
    href: '/admin/users',
    // Доступно для ADMIN и CHIEF_DOCTOR
  },
];

interface AdminMenuProps {
  onNavigate?: (href: string) => void;
}

export function AdminMenu({ onNavigate }: AdminMenuProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);
  const { counts } = useUnreadCountsContext();

  // Check user role
  useEffect(() => {
    const checkRole = async () => {
      try {
        const res = await fetch('/api/admin/auth');
        const data = await res.json();
        setUserRole(data.role || null);
      } catch (error) {
        setUserRole(null);
      }
    };
    checkRole();
  }, []);

  // Filter menu items based on role
  const menuItems = useMemo(() => {
    if (!userRole) return [];

    return allMenuItems.filter(item => {
      // Для OPERATOR доступен только "Чат"
      if (userRole === 'OPERATOR') {
        return item.operatorAccess === true;
      }

      // Для CHIEF_DOCTOR доступны все, включая chiefDoctorOnly
      if (userRole === 'CHIEF_DOCTOR') {
        return true;
      }

      // Для ADMIN доступны все кроме chiefDoctorOnly
      if (userRole === 'ADMIN') {
        return !item.chiefDoctorOnly;
      }

      return false;
    });
  }, [userRole]);

  const handleItemClick = (item: MenuItem) => {
    if (onNavigate) {
      onNavigate(item.href);
    } else {
      router.push(item.href);
    }
    setMobileMenuOpen(false);
  };

  const handleExitAdmin = () => {
    router.push('/');
    setMobileMenuOpen(false);
  };

  const isActive = (href: string) => {
    if (href === '/admin') {
      return pathname === '/admin' || pathname === '/admin/specialists';
    }
    return pathname === href || pathname?.startsWith(href + '/');
  };

  // Получаем количество непрочитанных для конкретного пункта меню
  const getUnreadCount = (itemId: string) => {
    if (itemId === 'feedbacks') {
      return counts.feedbacks;
    }
    if (itemId === 'letters') {
      return counts.letters;
    }
    if (itemId === 'chat') {
      return counts.chats || 0;
    }
    return 0;
  };

  const MenuContent = () => (
    <div className="bg-white h-full flex flex-col">
      {/* Header */}
      <div className="p-4 lg:p-6 border-b border-gray-100 bg-gradient-to-r from-white to-gray-50">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-br from-[#18A36C] to-[#15905f] rounded-xl flex items-center justify-center flex-shrink-0 shadow-md">
            <Shield className="w-6 h-6 text-white" />
          </div>
          <div className="text-left flex-1">
            <h2 className="text-lg lg:text-xl font-semibold text-gray-800">
              Админ-панель
            </h2>
            <p className="text-xs lg:text-sm text-gray-500 mt-0.5">Управление контентом</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto">
        <nav className="py-4 px-2">
          {menuItems.map((item) => {
            const unreadCount = getUnreadCount(item.id);
            return (
              <button
                key={item.id}
                onClick={() => handleItemClick(item)}
                className={`w-full flex items-center justify-between px-4 py-3 text-left transition-all duration-300 group rounded-lg mx-1 mb-1 cursor-pointer ${
                  isActive(item.href)
                    ? 'bg-[#18A36C]/10 text-[#18A36C] shadow-sm'
                    : 'hover:bg-gray-50'
                }`}
                style={{ width: 'calc(100% - 8px)' }}
              >
                <div className="flex items-center gap-3">
                  <div className={`flex-shrink-0 transition-all duration-300 relative ${
                    isActive(item.href)
                      ? 'text-[#18A36C] scale-110'
                      : 'text-gray-500 group-hover:text-[#18A36C] group-hover:scale-110'
                  }`}>
                    {item.icon}
                    {/* Красный индикатор для непрочитанных */}
                    {unreadCount > 0 && (
                      <span className="absolute -top-1 -right-1 flex items-center justify-center min-w-[18px] h-[18px] bg-red-500 text-white text-[10px] font-bold rounded-full px-1">
                        {unreadCount > 99 ? '99+' : unreadCount}
                      </span>
                    )}
                  </div>
                  <span className={`font-medium transition-colors duration-300 ${
                    isActive(item.href) ? 'text-[#18A36C]' : 'text-gray-700 group-hover:text-[#18A36C]'
                  }`}>
                    {item.title}
                  </span>
                </div>
                {isActive(item.href) && (
                  <ChevronRight className="w-4 h-4 text-[#18A36C]" />
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Footer with exit button */}
      <div className="p-4 border-t border-gray-100 space-y-3">
        <button
          onClick={handleExitAdmin}
          className="w-full flex items-center gap-3 px-4 py-3 text-left transition-all duration-300 group rounded-lg hover:bg-gray-50 cursor-pointer"
        >
          <Home className="w-4 h-4 text-gray-500 group-hover:text-[#18A36C] transition-colors" />
          <span className="font-medium text-gray-700 group-hover:text-[#18A36C] transition-colors">
            На сайт
          </span>
        </button>
        <p className="text-xs text-gray-500 text-center font-medium">
          Doctor Family © 2025
        </p>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop menu */}
      <div className="hidden lg:block w-80 flex-shrink-0 sticky top-0 h-screen overflow-y-auto bg-white border-r border-gray-200 shadow-lg">
        <MenuContent />
      </div>

      {/* Mobile menu */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
          <SheetTrigger asChild>
            <Button
              size="sm"
              className="bg-[#18A36C] hover:bg-[#18A36C]/90 text-white shadow-xl rounded-full w-14 h-14 p-0 transition-all duration-300 hover:scale-110 active:scale-95 cursor-pointer"
            >
              <Shield className="w-6 h-6" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-80 p-0">
            <SheetHeader className="sr-only">
              <SheetTitle>Админ-панель</SheetTitle>
              <SheetDescription>Управление контентом сайта</SheetDescription>
            </SheetHeader>
            <MenuContent />
          </SheetContent>
        </Sheet>
      </div>
    </>
  );
}
