'use client';

import { useState, useEffect } from 'react';
import { ChevronRight, Stethoscope, Menu } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '../common/SMButton/SMButton';
import { Tooltip, TooltipContent, TooltipTrigger } from '../common/SMTooltip/SMTooltip';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetTrigger } from '../common/SMSheet/SMSheet';
import { useRouter as useNextRouter, usePathname } from 'next/navigation';
import { useMenu } from '../SMMenuContext/SMMenuContext';
import { MenuSkeleton } from '../common/SMMenuSkeleton';
import servicesMenuConfig from '@/config/servicesMenu.json';
import { iconMap, IconName } from '@/utils/iconMapper';

interface MenuItem {
  id: string;
  title: string;
  icon?: string;
  children?: MenuItem[];
}

interface MenuItemProps {
  item: MenuItem;
  level: number;
  activeItem: string | null;
  onItemClick: (itemId: string, item: MenuItem) => void;
  expandedItems: Set<string>;
  onToggleExpand: (itemId: string) => void;
}

function MenuItemComponent({
  item,
  level,
  activeItem,
  onItemClick,
  expandedItems,
  onToggleExpand
}: MenuItemProps) {
  const hasChildren = item.children && item.children.length > 0;
  const isExpanded = expandedItems.has(item.id);
  const isActive = activeItem === item.id;

  const handleTitleClick = () => {
    // Клик на название всегда переходит на страницу
    onItemClick(item.id, item);
  };

  const handleArrowClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    // Клик на стрелочку только раскрывает/закрывает
    if (hasChildren) {
      onToggleExpand(item.id);
    }
  };

  const getItemStyles = () => {
    if (level === 0) {
      return isActive
        ? 'bg-[#18A36C]/10 text-[#18A36C] shadow-sm rounded-lg mx-2'
        : 'text-gray-700 hover:bg-gray-50 rounded-lg mx-2 hover:text-[#18A36C]';
    } else if (level === 1) {
      return isActive
        ? 'bg-[#18A36C]/10 text-[#18A36C] rounded-lg mx-2'
        : 'text-gray-600 hover:bg-gray-50 rounded-lg mx-2 hover:text-[#18A36C]';
    } else {
      return isActive
        ? 'bg-[#18A36C]/5 text-[#18A36C] rounded-lg mx-2'
        : 'text-gray-500 hover:bg-gray-50 rounded-lg mx-2 hover:text-[#18A36C]';
    }
  };

  const Icon = item.icon ? iconMap[item.icon as IconName] : null;

  return (
    <div className="group overflow-hidden">
      <div
        className={`w-full flex items-center justify-between transition-all duration-200 overflow-hidden ${getItemStyles()}`}
        style={{ paddingLeft: `${level * 12 + 12}px` }}
      >
        <div
          className="flex items-center gap-2 flex-1 min-w-0 overflow-hidden py-3 px-3 cursor-pointer"
          onClick={handleTitleClick}
        >
          {level === 0 && Icon && (
            <div className={`flex-shrink-0 ${isActive ? 'text-[#18A36C]' : 'text-[#18A36C]'}`}>
              <Icon className="w-4 h-4" />
            </div>
          )}
          <Tooltip>
            <TooltipTrigger asChild>
              <span className={`transition-all duration-200 truncate block ${
                level === 0 ? 'text-sm font-medium' : level === 1 ? 'text-sm' : 'text-xs'
              } ${isActive ? 'text-[#18A36C]' : ''}`}>
                {item.title}
              </span>
            </TooltipTrigger>
            <TooltipContent side="right" className="max-w-xs z-[100]">
              {item.title}
            </TooltipContent>
          </Tooltip>
        </div>
        {hasChildren && (
          <div
            className={`hidden lg:flex flex-shrink-0 transition-transform duration-200 p-3 cursor-pointer hover:bg-gray-100 rounded ${
              isExpanded ? 'rotate-90' : ''
            } ${isActive && level === 0 ? 'text-[#18A36C]' : 'text-gray-400'}`}
            onClick={handleArrowClick}
          >
            <ChevronRight className="w-4 h-4" />
          </div>
        )}
      </div>

      {/* Показываем children только на desktop */}
      <AnimatePresence initial={false}>
        {hasChildren && isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="overflow-hidden hidden lg:block"
          >
            <div className="bg-white">
              {item.children!.map((child) => (
                <div key={child.id}>
                  <MenuItemComponent
                    item={child}
                    level={level + 1}
                    activeItem={activeItem}
                    onItemClick={onItemClick}
                    expandedItems={expandedItems}
                    onToggleExpand={onToggleExpand}
                  />
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function NavigableServicesMenu() {
  const [activeItem, setActiveItem] = useState<string | null>(null);
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [categories, setCategories] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const nextRouter = useNextRouter();
  const currentRoute = usePathname();
  const { isBurgerMenuOpen } = useMenu();

  // Load menu data from API
  useEffect(() => {
    const fetchMenuData = async () => {
      setLoading(true);
      try {
        const response = await fetch('/api/services-menu');
        if (response.ok) {
          const data = await response.json();
          setCategories(data.menuData || []);
        } else {
          console.error('Failed to fetch services menu');
        }
      } catch (error) {
        console.error('Error fetching services menu:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMenuData();
  }, []);

  const menuData = categories;

  // Auto-expand and select based on current route
  useEffect(() => {
    if (!menuData.length) return;

    const routeParts = currentRoute.split('/').filter(Boolean);
    if (routeParts[0] === 'services' && routeParts.length >= 2) {
      const categorySlug = routeParts[1];

      // Set active item
      setActiveItem(categorySlug);

      // Find and expand parents
      const findParents = (items: MenuItem[], targetId: string, parents: string[] = []): string[] | null => {
        for (const item of items) {
          if (item.id === targetId) {
            return parents;
          }
          if (item.children) {
            const found = findParents(item.children, targetId, [...parents, item.id]);
            if (found) return found;
          }
        }
        return null;
      };

      const parents = findParents(menuData, categorySlug);
      const nextExpanded = new Set(parents || []);
      const activeRoot = menuData.find((item) => item.id === categorySlug);
      if (activeRoot?.children && activeRoot.children.length > 0) {
        nextExpanded.add(categorySlug);
      }
      setExpandedItems(nextExpanded);
    } else if (routeParts[0] === 'services' && routeParts.length === 1) {
      // На главной странице услуг - сбрасываем активный пункт
      setActiveItem(null);
      setExpandedItems(new Set());
    }
  }, [currentRoute, menuData]);

  const handleItemClick = (itemId: string, item: MenuItem) => {
    // Обновляем activeItem только если он изменился
    if (activeItem !== itemId) {
      setActiveItem(itemId);
    }

    // При клике на категорию сразу раскрываем её подкатегории
    if (item.children && item.children.length > 0) {
      setExpandedItems((prev) => {
        const next = new Set(prev);
        next.add(itemId);
        return next;
      });
    }

    // Всегда переходим на страницу категории
    nextRouter.push(`/services/${itemId}`);
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
    <div className="bg-white flex flex-col h-full">
      {/* Header - Fixed */}
      <div className="p-4 lg:p-6 border-b border-gray-100 bg-gradient-to-r from-white to-gray-50 flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-br from-[#18A36C] to-[#15905f] rounded-xl flex items-center justify-center flex-shrink-0 shadow-md">
            <Stethoscope className="w-6 h-6 text-white" />
          </div>
          <div className="text-left flex-1 min-w-0">
            <h2 className="text-lg lg:text-xl font-semibold text-gray-800 truncate">
              {servicesMenuConfig.header.title}
            </h2>
            <p className="text-xs lg:text-sm text-gray-500 mt-0.5 truncate">
              {servicesMenuConfig.header.subtitle}
            </p>
          </div>
        </div>
      </div>

      {/* Scrollable Menu Items */}
      <div
        className="flex-1 overflow-y-scroll overflow-x-hidden py-2"
        style={{ scrollbarGutter: 'stable' }}
      >
        {loading ? (
          <MenuSkeleton itemCount={8} showHeader={false} showFooter={false} />
        ) : menuData.length > 0 ? (
          menuData.map((item) => (
            <MenuItemComponent
              key={item.id}
              item={item}
              level={0}
              activeItem={activeItem}
              onItemClick={onItemClickProp || handleItemClick}
              expandedItems={expandedItems}
              onToggleExpand={handleToggleExpand}
            />
          ))
        ) : (
          <div className="px-4 py-6 text-sm text-gray-500">Услуги не найдены</div>
        )}
      </div>

      {/* Footer - Fixed */}
      <div className="p-3 lg:p-4 border-t border-[#E8E6E3] bg-white flex-shrink-0">
        <div className="text-center">
          <p className="text-xs text-gray-600 mb-2 lg:mb-3">
            {servicesMenuConfig.footer.text}
          </p>
          <Button
            size="sm"
            onClick={() => nextRouter.push('/contacts')}
            className="bg-[#18A36C] hover:bg-[#18A36C]/90 text-white w-full text-xs cursor-pointer"
          >
            {servicesMenuConfig.footer.buttonText}
          </Button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <div
        className="hidden lg:block w-72 bg-white border-r border-[#CACACA] shadow-lg flex-shrink-0 sticky top-[80px] h-[calc(100vh-80px)] overflow-y-scroll"
        style={{ scrollbarGutter: 'stable' }}
      >
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
              <Menu className="w-6 h-6" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-[350px] p-0">
            <SheetHeader className="sr-only">
              <SheetTitle>Меню услуг</SheetTitle>
              <SheetDescription>Навигация по медицинским услугам клиники</SheetDescription>
            </SheetHeader>
            <MenuContent onItemClick={(itemId, item) => {
              handleItemClick(itemId, item);
              setMobileMenuOpen(false);
            }} />
          </SheetContent>
        </Sheet>
      </div>
    </>
  );
}
