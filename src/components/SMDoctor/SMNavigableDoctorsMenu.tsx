'use client';

import { useEffect, useMemo, useState } from 'react';
import { ChevronRight, Users } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '../common/SMButton/SMButton';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetTrigger } from '../common/SMSheet/SMSheet';
import { useRouter as useSMRouter } from '../SMRouter/SMRouter';
import { useRouter } from 'next/navigation';
import { useMenu } from '../SMMenuContext/SMMenuContext';
import { MenuSkeleton } from '../common/SMMenuSkeleton';
import { Tooltip, TooltipTrigger, TooltipContent } from '../common/SMTooltip/SMTooltip';
import { iconMap, IconName } from '@/utils/iconMapper';

interface MenuItem {
  id: string;
  title: string;
  icon?: React.ReactNode;
  children?: MenuItem[];
}

interface ServiceCategory {
  id: number;
  name: string;
  slug: string;
  icon: string | null;
}

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
  
  return (
    <div className="px-2">
      <Button
        variant="ghost"
        className={`w-full justify-start px-4 py-3 h-auto text-left transition-all duration-300 rounded-lg mb-1 ${
          isActive || isRouteActive
            ? 'bg-[#18A36C]/10 text-[#18A36C] shadow-sm'
            : 'text-gray-700 hover:bg-gray-50 hover:text-[#18A36C]'
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
            <Tooltip>
              <TooltipTrigger asChild>
                <span className={`text-sm lg:text-base transition-colors truncate max-w-[180px] ${
                  isActive || isRouteActive ? 'text-[#18A36C] font-medium' : ''
                }`}>
                  {item.title}
                </span>
              </TooltipTrigger>
              <TooltipContent side="right">
                {item.title}
              </TooltipContent>
            </Tooltip>
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
      
      <AnimatePresence>
        {hasChildren && isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div className="bg-white">
              {item.children!.map((child, index) => (
                <motion.div
                  key={child.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05, duration: 0.2 }}
                >
                  <MenuItemComponent
                    item={child}
                    level={level + 1}
                    activeItem={activeItem}
                    onItemClick={onItemClick}
                    expandedItems={expandedItems}
                    onToggleExpand={onToggleExpand}
                    currentRoute={currentRoute}
                  />
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function NavigableDoctorsMenu() {
  const [categories, setCategories] = useState<ServiceCategory[]>([]);
  const [activeItem, setActiveItem] = useState<string | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { navigate, currentRoute } = useSMRouter();
  const router = useRouter();
  const { isBurgerMenuOpen } = useMenu();

  useEffect(() => {
    const fetchCategories = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch('/api/service-categories');
        if (!response.ok) {
          throw new Error('Failed to fetch service categories');
        }
        const data: ServiceCategory[] = await response.json();
        setCategories(data);
      } catch (err) {
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
    } else if (routeParts[0] === 'doctors' && routeParts.length === 1) {
      // На главной странице специалистов - сбрасываем активный пункт
      setActiveItem(null);
    }
  }, [currentRoute]);

  const menuItems = useMemo<MenuItem[]>(() => {
    return categories.map((category) => {
      const IconComponent =
        category.icon && iconMap[category.icon as IconName]
          ? iconMap[category.icon as IconName]
          : Users;

      return {
        id: category.slug,
        title: category.name,
        icon: <IconComponent className="w-4 h-4" />,
      };
    });
  }, [categories]);

  const handleItemClick = (itemId: string, _item: MenuItem) => {
    setActiveItem(itemId);
    navigate(`/doctors/${itemId}`);
  };

  const MenuContent = ({ onItemClick: onItemClickProp }: { onItemClick?: (itemId: string, item: MenuItem) => void }) => (
    <div className="bg-white flex flex-col h-full">
      {/* Header - Fixed */}
      <div className="p-4 lg:p-6 border-b border-gray-100 bg-gradient-to-r from-white to-gray-50 flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-br from-[#18A36C] to-[#15905f] rounded-xl flex items-center justify-center flex-shrink-0 shadow-md">
            <Users className="w-6 h-6 text-white" />
          </div>
          <div className="text-left flex-1">
            <h2 className="text-lg lg:text-xl font-semibold text-gray-800">Специалисты</h2>
            <p className="text-xs lg:text-sm text-gray-500 mt-0.5">Выберите нужное направление</p>
          </div>
        </div>
      </div>

      {/* Scrollable Menu Items */}
      <div
        className="flex-1 overflow-y-scroll py-2"
        style={{ scrollbarGutter: 'stable' }}
      >
        {isLoading ? (
          <MenuSkeleton itemCount={8} showHeader={false} showFooter={false} />
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
              expandedItems={new Set()}
              onToggleExpand={() => {}}
              currentRoute={currentRoute}
            />
          ))
        ) : (
          <div className="px-4 py-6 text-sm text-gray-500">Категории не найдены</div>
        )}
      </div>

      {/* Footer - Fixed */}
      <div className="p-3 lg:p-4 border-t border-[#E8E6E3] bg-white flex-shrink-0">
        <div className="text-center">
          <p className="text-xs text-gray-600 mb-2 lg:mb-3">Не нашли нужного специалиста?</p>
          <Button
            size="sm"
            onClick={() => router.push('/contacts')}
            className="bg-[#18A36C] hover:bg-[#18A36C]/90 text-white w-full text-xs rounded-lg cursor-pointer"
          >
            Связаться с нами
          </Button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <div
        className="hidden lg:block w-72 bg-white border-r border-[#E8E6E3] shadow-lg flex-shrink-0 sticky top-[80px] h-[calc(100vh-80px)] overflow-y-scroll"
        style={{ scrollbarGutter: 'stable' }}
      >
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