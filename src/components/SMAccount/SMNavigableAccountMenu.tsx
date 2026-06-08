'use client';
import { useState } from 'react';
import { ChevronRight, ChevronDown, Settings, FileText, MessageSquare, LogOut, Menu, X, User, CalendarDays } from 'lucide-react';
import { Button } from '../common/SMButton/SMButton';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetTrigger, SheetClose } from '../common/SMSheet/SMSheet';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../common/SMDialog/SMDialog';
import { useRouter } from '../SMRouter/SMRouter';
import { useMenu } from '../SMMenuContext/SMMenuContext';
import { signOut } from 'next-auth/react';

interface MenuItem {
  id: string;
  title: string;
  icon?: React.ReactNode;
  children?: MenuItem[];
  isAction?: boolean;
}

const menuData: MenuItem[] = [
  {
    id: 'appointments',
    title: 'Записи',
    icon: <CalendarDays className="w-4 h-4" />,
    children: []
  },
  {
    id: 'materials',
    title: 'Материалы',
    icon: <FileText className="w-4 h-4" />,
    children: []
  },
  {
    id: 'contact',
    title: 'Написать глав.врачу',
    icon: <MessageSquare className="w-4 h-4" />,
    children: []
  },
  {
    id: 'logout',
    title: 'Выйти',
    icon: <LogOut className="w-4 h-4" />,
    children: [],
    isAction: true
  }
];

interface MenuItemComponentProps {
  item: MenuItem;
  level: number;
  expandedItems: Set<string>;
  setExpandedItems: (items: Set<string>) => void;
  selectedItem: string | null;
  onItemClick: (item: MenuItem) => void;
}

function MenuItemComponent({ 
  item, 
  level, 
  expandedItems, 
  setExpandedItems, 
  selectedItem,
  onItemClick 
}: MenuItemComponentProps) {
  const hasChildren = item.children && item.children.length > 0;
  const isExpanded = expandedItems.has(item.id);
  const isSelected = selectedItem === item.id;

  const handleToggle = () => {
    if (hasChildren) {
      const newExpanded = new Set(expandedItems);
      if (isExpanded) {
        newExpanded.delete(item.id);
      } else {
        newExpanded.add(item.id);
      }
      setExpandedItems(newExpanded);
    } else {
      onItemClick(item);
    }
  };

  return (
    <div className={level === 0 ? 'mb-1' : ''}>
      <button
        onClick={handleToggle}
        className={`w-full flex items-center justify-between px-4 py-3 text-left transition-all duration-300 group rounded-lg mx-1 cursor-pointer ${
          isSelected
            ? 'bg-[#18A36C]/10 text-[#18A36C] shadow-sm'
            : 'hover:bg-gray-50'
        } ${level > 0 ? 'ml-6 border-l-2 border-gray-200' : ''} ${
          item.isAction ? 'hover:bg-red-50' : ''
        }`}
        style={{ width: 'calc(100% - 8px)' }}
      >
        <div className="flex items-center gap-3">
          {item.icon && (
            <div className={`flex-shrink-0 transition-all duration-300 ${
              isSelected
                ? 'text-[#18A36C] scale-110'
                : 'text-gray-500 group-hover:text-[#18A36C] group-hover:scale-110'
            } ${item.isAction ? 'text-red-500 group-hover:text-red-600' : ''}`}>
              {item.icon}
            </div>
          )}
          <span className={`font-medium transition-colors duration-300 ${
            isSelected ? 'text-[#18A36C]' : 'text-gray-700 group-hover:text-[#18A36C]'
          } ${item.isAction ? 'text-red-500 group-hover:text-red-600' : ''}`}>
            {item.title}
          </span>
        </div>
        {hasChildren && (
          <div className={`flex-shrink-0 transition-all duration-300 ${
            isSelected ? 'text-[#18A36C]' : 'text-gray-400 group-hover:text-[#18A36C]'
          }`}>
            {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
          </div>
        )}
      </button>

      {hasChildren && isExpanded && (
        <div className="ml-4">
          {item.children!.map((child) => (
            <MenuItemComponent
              key={child.id}
              item={child}
              level={level + 1}
              expandedItems={expandedItems}
              setExpandedItems={setExpandedItems}
              selectedItem={selectedItem}
              onItemClick={onItemClick}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export function NavigableAccountMenu() {
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
  const { navigate, currentRoute } = useRouter();
  const { isBurgerMenuOpen } = useMenu();

  // Sync selectedItem with URL
  const pathParts = currentRoute.replace(/^\/+|\/+$/g, '').split('/');
  let sectionFromUrl = '';
  if (pathParts[0] === 'account') {
    sectionFromUrl = pathParts[1] || '';
  }
  const selectedItem = sectionFromUrl && ['appointments', 'materials', 'contact'].includes(sectionFromUrl)
    ? sectionFromUrl
    : null;

  const handleItemClick = async (item: MenuItem) => {
    if (item.isAction && item.id === 'logout') {
      setMobileMenuOpen(false);
      setShowLogoutDialog(true);
      return;
    }
    
    navigate(`/account/${item.id}`);
    setMobileMenuOpen(false);
  };

  const handleLogoutConfirm = async () => {
    setShowLogoutDialog(false);
    await signOut({ 
      callbackUrl: "/",
      redirect: true 
    });
  };

  const handleHeaderClick = () => {
    // Если находимся в подразделе, возвращаемся на главную страницу аккаунта
    if (sectionFromUrl) {
      navigate('/account');
      setMobileMenuOpen(false);
    }
  };

  const MenuContent = ({ onItemClick: onItemClickProp }: { onItemClick?: (item: MenuItem) => void }) => (
    <div className="bg-white h-full flex flex-col">
      {/* Header with gradient accent */}
      <div className="p-4 lg:p-6 border-b border-gray-100 bg-gradient-to-r from-white to-gray-50">
        <button
          onClick={handleHeaderClick}
          className={`w-full flex items-center gap-3 transition-all duration-300 ${
            sectionFromUrl
              ? 'cursor-pointer hover:bg-[#18A36C]/5 rounded-xl p-3 -m-3'
              : 'cursor-default p-3 -m-3'
          }`}
          disabled={!sectionFromUrl}
        >
          <div className="w-12 h-12 bg-gradient-to-br from-[#18A36C] to-[#15905f] rounded-xl flex items-center justify-center flex-shrink-0 shadow-md">
            <User className="w-6 h-6 text-white" />
          </div>
          <div className="text-left flex-1">
            <h2 className={`text-lg lg:text-xl font-semibold transition-colors duration-300 ${
              sectionFromUrl
                ? 'text-[#18A36C]'
                : 'text-gray-800'
            }`}>
              Личный кабинет
            </h2>
            <p className="text-xs lg:text-sm text-gray-500 mt-0.5">Управление аккаунтом</p>
          </div>
          {sectionFromUrl && (
            <ChevronRight className="w-5 h-5 text-[#18A36C] flex-shrink-0 transition-transform duration-300 group-hover:translate-x-1" />
          )}
        </button>
      </div>

      {/* Navigation items */}
      <div className="flex-1 overflow-y-auto">
        <nav className="py-4 px-2">
          {menuData.map((item) => (
            <MenuItemComponent
              key={item.id}
              item={item}
              level={0}
              expandedItems={expandedItems}
              setExpandedItems={setExpandedItems}
              selectedItem={selectedItem}
              onItemClick={onItemClickProp || handleItemClick}
            />
          ))}
        </nav>
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-gray-100 bg-gradient-to-r from-gray-50 to-white">
        <p className="text-xs text-gray-500 text-center font-medium">
          Doctor Family © 2025
        </p>
      </div>
    </div>
  );

  return (
    <>
      <div className="hidden lg:block w-80 flex-shrink-0 sticky top-[80px] h-[calc(100vh-80px)] overflow-y-auto bg-white border-r border-gray-200 shadow-lg">
        <MenuContent />
      </div>

      <div className="lg:hidden fixed top-24 left-4 z-50">
        <Sheet open={mobileMenuOpen && !isBurgerMenuOpen} onOpenChange={(open) => !isBurgerMenuOpen && setMobileMenuOpen(open)}>
          <SheetTrigger asChild>
            <Button
              size="sm"
              disabled={isBurgerMenuOpen}
              className="bg-[#18A36C] hover:bg-[#18A36C]/90 text-white shadow-xl rounded-full w-14 h-14 p-0 transition-all duration-300 hover:scale-110 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <User className="w-6 h-6" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-80 p-0">
            <SheetHeader className="sr-only">
              <SheetTitle>Личный кабинет</SheetTitle>
              <SheetDescription>Управление аккаунтом и настройками</SheetDescription>
            </SheetHeader>
            <MenuContent onItemClick={handleItemClick} />
          </SheetContent>
        </Sheet>
      </div>

      <Dialog open={showLogoutDialog} onOpenChange={setShowLogoutDialog}>
        <DialogContent className="sm:max-w-md border-0">
          <DialogHeader>
            <DialogTitle className="text-xl text-[#2E2E2E]">
              Подтверждение выхода
            </DialogTitle>
            <DialogDescription className="text-gray-600 pt-2">
              Вы уверены, что хотите выйти из аккаунта?
              <br />
              Вам потребуется войти снова для доступа к личному кабинету.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex flex-col sm:flex-row gap-3 sm:gap-2 pt-4">
            <Button
              variant="outline"
              onClick={() => setShowLogoutDialog(false)}
              className="w-full sm:w-auto border-gray-300 text-[#2E2E2E] hover:bg-gray-50"
            >
              Отмена
            </Button>
            <Button
              onClick={handleLogoutConfirm}
              className="w-full sm:w-auto bg-red-600 hover:bg-red-700 text-white"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Выйти
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}