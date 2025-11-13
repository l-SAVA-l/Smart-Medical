'use client';

import type { ComponentType } from 'react';
import { useEffect, useMemo, useState } from 'react';
import { ChevronRight, Baby, Smile, Heart, Stethoscope, Activity, Eye, Search, Building2, Users, Syringe } from 'lucide-react';
import { Button } from '../common/SMButton/SMButton';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetTrigger } from '../common/SMSheet/SMSheet';
import { useRouter } from '../SMRouter/SMRouter';
import { useMenu } from '../SMMenuContext/SMMenuContext';

interface MenuItem {
  id: string;
  title: string;
  icon?: React.ReactNode;
  children?: MenuItem[];
}

interface Category {
  id: number;
  name: string;
  slug: string;
}

const iconComponentMap: Record<string, ComponentType<{ className?: string }>> = {
  'pediatric-dentistry': Baby,
  dentistry: Smile,
  cardiology: Heart,
  gynecology: Heart,
  endocrinology: Activity,
  oncology: Stethoscope,
  urology: Search,
  anesthesiology: Syringe,
  ultrasound: Eye,
  'day-hospital': Building2,
};

const getIconForSlug = (slug: string) => {
  const Icon = iconComponentMap[slug] ?? Users;
  return <Icon className="w-4 h-4" />;
};

interface MenuItemProps {
  item: MenuItem;
  level: number;
  activeItem: string | null;
  onItemClick: (itemId: string, item: MenuItem) => void;
  expandedItems: Set<string>;
  onToggleExpand: (itemId: string) => void;
  currentRoute: string;
}

function MenuItemComponent({ item, level, activeItem, onItemClick, expandedItems, onToggleExpand, currentRoute }: MenuItemProps) {
  const hasChildren = item.children && item.children.length > 0;
  const isExpanded = expandedItems.has(item.id);
  const isActive = activeItem === item.id;
  
  const isRouteActive = currentRoute.includes(`/doctors/${item.id}`);
  
  const paddingLeft = level === 0 ? 'pl-4' : level === 1 ? 'pl-8' : 'pl-12';
  
  return (
    <div>
      <Button
        variant="ghost"
        className={`w-full justify-start ${paddingLeft} pr-4 py-3 h-auto text-left transition-all duration-200 rounded-none border-l-4 hover:bg-white hover:border-l-[#18A36C] ${
          isActive || isRouteActive 
            ? 'bg-[#18A36C]/10 border-l-[#18A36C] text-[#18A36C]' 
            : 'border-l-transparent text-[#2E2E2E] hover:text-[#18A36C]'
        }`}
        onClick={() => {
          if (hasChildren) {
            onToggleExpand(item.id);
          } else {
            onItemClick(item.id, item);
          }
        }}
      >
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-3">
            {item.icon && (
              <div className={`text-[#18A36C] transition-colors ${isActive || isRouteActive ? 'text-[#18A36C]' : ''}`}>
                {item.icon}
              </div>
            )}
            <span className={`text-sm lg:text-base break-words-soft transition-colors ${
              isActive || isRouteActive ? 'text-[#18A36C] font-medium' : ''
            }`}>
              {item.title}
            </span>
          </div>
          
          {hasChildren && (
            <ChevronRight 
              className={`w-4 h-4 text-gray-400 transition-all duration-200 ${
                isExpanded ? 'rotate-90 text-[#18A36C]' : 'group-hover:text-[#18A36C] group-hover:translate-x-1'
              }`} 
            />
          )}
        </div>
      </Button>
      
      {hasChildren && (
        <div className={`overflow-hidden transition-all duration-300 ease-in-out ${
          isExpanded ? 'max-h-[1000px] opacity-100' : 'max-h-0 opacity-0'
        }`}>
          <div className="bg-white">
            {item.children!.map((child) => (
              <MenuItemComponent
                key={child.id}
                item={child}
                level={level + 1}
                activeItem={activeItem}
                onItemClick={onItemClick}
                expandedItems={expandedItems}
                onToggleExpand={onToggleExpand}
                currentRoute={currentRoute}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export function NavigableDoctorsMenu() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [activeItem, setActiveItem] = useState<string | null>(null);
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { navigate, currentRoute } = useRouter();
  const { isBurgerMenuOpen } = useMenu();

  useEffect(() => {
    const fetchCategories = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch('/api/categories');
        if (!response.ok) {
          throw new Error('Failed to fetch categories');
        }
        const data: Category[] = await response.json();
        setCategories(data);
      } catch (err) {
        console.error('Error fetching categories:', err);
        setError('Не удалось загрузить категории');
      } finally {
        setIsLoading(false);
      }
    };

    fetchCategories();
  }, []);

  useEffect(() => {
    const routeParts = currentRoute.split('/').filter(Boolean);
    if (routeParts[0] === 'doctors' && routeParts[1]) {
      setActiveItem(routeParts[1]);
    }
  }, [currentRoute]);

  const menuItems = useMemo<MenuItem[]>(() => {
    const sortedCategories = [...categories].sort((a, b) =>
      a.name.localeCompare(b.name, 'ru')
    );

    return sortedCategories.map((category) => ({
      id: category.slug,
      title: category.name,
      icon: getIconForSlug(category.slug),
    }));
  }, [categories]);

  const handleItemClick = (itemId: string, _item: MenuItem) => {
    setActiveItem(itemId);
    navigate(`/doctors/${itemId}`);
  };

  const handleToggleExpand = (itemId: string) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(itemId)) {
      newExpanded.delete(itemId);
    } else {
      newExpanded.add(itemId);
    }
    setExpandedItems(newExpanded);
  };

  const MenuContent = ({ onItemClick: onItemClickProp }: { onItemClick?: (itemId: string, item: MenuItem) => void }) => (
    <div className="bg-white flex flex-col">
      <div className="bg-[#18A36C] p-4 lg:p-6">
        <h2 className="text-white text-lg lg:text-xl mb-1 lg:mb-2">Специалисты</h2>
        <p className="text-white/80 text-xs lg:text-sm">Выберите нужное направление</p>
      </div>
      
      <div className="py-2">
        {isLoading ? (
          <div className="px-4 py-6 text-sm text-gray-500">Загрузка категорий...</div>
        ) : error ? (
          <div className="px-4 py-6 text-sm text-red-600">{error}</div>
        ) : menuItems.length > 0 ? (
          menuItems.map((item) => (
            <MenuItemComponent
              key={item.id}
              item={item}
              level={0}
              activeItem={activeItem}
              onItemClick={onItemClickProp || handleItemClick}
              expandedItems={expandedItems}
              onToggleExpand={handleToggleExpand}
              currentRoute={currentRoute}
            />
          ))
        ) : (
          <div className="px-4 py-6 text-sm text-gray-500">Категории не найдены</div>
        )}
      </div>
      
      <div className="p-3 lg:p-4 mt-2 lg:mt-4 border-t border-[#E8E6E3] bg-white">
        <div className="text-center">
          <p className="text-xs text-gray-600 mb-2 lg:mb-3">Не нашли нужного специалиста?</p>
          <Button 
            size="sm" 
            className="bg-[#18A36C] hover:bg-[#18A36C]/90 text-white w-full text-xs rounded-lg"
          >
            Связаться с нами
          </Button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <div className="hidden lg:block w-72 bg-white border-r border-[#E8E6E3] shadow-lg flex-shrink-0 sticky top-[80px] h-[calc(100vh-80px)] overflow-y-auto">
        <MenuContent />
      </div>

      <div className="lg:hidden fixed top-24 left-4 z-50">
        <Sheet open={mobileMenuOpen && !isBurgerMenuOpen} onOpenChange={(open: boolean) => !isBurgerMenuOpen && setMobileMenuOpen(open)}>
          <SheetTrigger asChild>
            <Button
              size="sm"
              disabled={isBurgerMenuOpen}
              className="bg-[#18A36C] hover:bg-[#18A36C]/90 text-white shadow-xl rounded-full w-14 h-14 p-0 transition-all duration-300 hover:scale-110 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Users className="w-6 h-6" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-80 p-0">
            <SheetHeader className="sr-only">
              <SheetTitle>Меню специалистов</SheetTitle>
              <SheetDescription>Навигация по специалистам клиники</SheetDescription>
            </SheetHeader>
            <MenuContent
              onItemClick={(itemId, item) => {
                handleItemClick(itemId, item);
                setMobileMenuOpen(false);
              }}
            />
          </SheetContent>
        </Sheet>
      </div>
    </>
  );
}