'use client';
import { useState } from 'react';
import { ChevronRight, ChevronDown, Settings, FileText, MessageSquare, LogOut, Menu, X, User } from 'lucide-react';
import { Button } from '../common/SMButton/SMButton';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetTrigger, SheetClose } from '../common/SMSheet/SMSheet';
import { useRouter } from '../SMRouter/SMRouter';
import { useMenu } from '../SMMenuContext/SMMenuContext';

interface MenuItem {
  id: string;
  title: string;
  icon?: React.ReactNode;
  children?: MenuItem[];
  isAction?: boolean;
}

const menuData: MenuItem[] = [
  {
    id: 'subscriptions',
    title: 'Подписки',
    icon: <Settings className="w-4 h-4" />,
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
    <div>
      <button
        onClick={handleToggle}
        className={`w-full flex items-center justify-between px-4 py-3 text-left hover:bg-gray-50 transition-all duration-300 group ${
          isSelected 
            ? 'bg-gray-50 border-r-4 border-[#18A36C]' 
            : ''
        } ${level > 0 ? 'ml-6 border-l-2 border-gray-200' : ''} ${
          item.isAction ? 'text-red-600 hover:text-red-700' : ''
        }`}
      >
        <div className="flex items-center gap-3">
          {item.icon && (
            <div className={`flex-shrink-0 transition-colors duration-300 ${
              isSelected ? 'text-[#18A36C]' : 'text-gray-500 group-hover:text-[#18A36C]'
            } ${item.isAction ? 'text-red-600 group-hover:text-red-700' : ''}`}>
              {item.icon}
            </div>
          )}
          <span className={`break-words-soft transition-colors duration-300 ${
            isSelected ? 'text-[#18A36C]' : 'text-gray-800 group-hover:text-[#18A36C]'
          } ${item.isAction ? 'text-red-600 group-hover:text-red-700' : ''}`}>
            {item.title}
          </span>
        </div>
        {hasChildren && (
          <div className={`flex-shrink-0 transition-all duration-300 ${
            isSelected ? 'text-[#18A36C]' : 'text-gray-500 group-hover:text-[#18A36C]'
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
  const { navigate, currentRoute } = useRouter();
  const { isBurgerMenuOpen } = useMenu();

  // Sync selectedItem with URL
  const pathParts = currentRoute.replace(/^\/+|\/+$/g, '').split('/');
  let sectionFromUrl = '';
  if (pathParts[0] === 'account') {
    sectionFromUrl = pathParts[1] || '';
  }
  const selectedItem = sectionFromUrl && ['subscriptions', 'materials', 'contact'].includes(sectionFromUrl)
    ? sectionFromUrl
    : null;

  const handleItemClick = (item: MenuItem) => {
    if (item.isAction && item.id === 'logout') {
      navigate('/');
      setMobileMenuOpen(false);
      return;
    }
    
    navigate(`/account/${item.id}`);
    setMobileMenuOpen(false);
  };

  const MenuContent = ({ onItemClick: onItemClickProp }: { onItemClick?: (item: MenuItem) => void }) => (
    <div className="bg-white h-full flex flex-col shadow-lg">
      <div className="p-4 lg:p-6 border-b border-gray-200 bg-white">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-[#18A36C] rounded-full flex items-center justify-center">
            <User className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-lg lg:text-xl text-gray-800 mb-1">Личный кабинет</h2>
            <p className="text-xs lg:text-sm text-gray-600">Управление аккаунтом</p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        <nav className="py-2">
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

      <div className="p-3 lg:p-4 border-t border-gray-200 bg-gray-50">
        <p className="text-xs text-gray-600 text-center">
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
    </>
  );
}