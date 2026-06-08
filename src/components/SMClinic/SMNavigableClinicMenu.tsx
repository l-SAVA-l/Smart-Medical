'use client';

import { useState, useEffect } from 'react';
import { ChevronRight, FileText, Users, Star, Building2, HelpCircle, Briefcase } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '../common/SMButton/SMButton';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetTrigger } from '../common/SMSheet/SMSheet';
import { Tooltip, TooltipTrigger, TooltipContent } from '../common/SMTooltip/SMTooltip';
import { useRouter } from 'next/navigation';
import { usePathname } from 'next/navigation';
import { useMenu } from '../SMMenuContext/SMMenuContext';

interface MenuItem {
  id: string;
  title: string;
  icon?: React.ReactNode;
  children?: MenuItem[];
}

interface PartnerApiItem {
  category?: {
    slug?: string;
    name?: string;
  };
}

const menuData: MenuItem[] = [
  {
    id: 'licenses',
    title: 'Лицензии',
    icon: <FileText className="w-4 h-4" />,
    children: []
  },
  {
    id: 'partners',
    title: 'Партнёры',
    icon: <Users className="w-4 h-4" />,
    children: [
      { id: 'medical-labs', title: 'Медицинские лаборатории' },
      { id: 'insurance', title: 'Страховые компании' },
      { id: 'dental-labs', title: 'Зуботехнические лаборатории' }
    ]
  },
  {
    id: 'reviews',
    title: 'Отзывы',
    icon: <Star className="w-4 h-4" />,
    children: []
  },
  {
    id: 'requisites',
    title: 'Реквизиты',
    icon: <Building2 className="w-4 h-4" />,
    children: []
  },
  {
    id: 'questions',
    title: 'Вопросы и ответы',
    icon: <HelpCircle className="w-4 h-4" />,
    children: [] // Будут загружены динамически из API
  },
  {
    id: 'vacancies',
    title: 'Вакансии',
    icon: <Briefcase className="w-4 h-4" />,
    children: []
  }
];

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

  const isRouteActive = currentRoute.includes(`/clinic/${item.id}`);

  const paddingLeft = level === 0 ? 'pl-4' : level === 1 ? 'pl-8' : 'pl-12';

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

  return (
    <div className="px-2" data-menu-item={item.id}>
      <div
        className={`w-full flex items-center justify-between transition-all duration-300 rounded-lg mb-1 overflow-hidden ${isActive || isRouteActive
          ? 'bg-[#18A36C]/10 text-[#18A36C] shadow-sm'
          : 'text-gray-700 hover:bg-gray-50 hover:text-[#18A36C]'
          }`}
      >
        <div
          className="flex items-center gap-3 flex-1 min-w-0 px-4 py-3 cursor-pointer"
          onClick={handleTitleClick}
        >
          {item.icon && (
            <div className={`flex-shrink-0 transition-colors ${isActive || isRouteActive ? 'text-[#18A36C]' : 'text-gray-600'}`}>
              {item.icon}
            </div>
          )}
          <Tooltip>
            <TooltipTrigger asChild>
              <span className={`text-sm lg:text-base transition-colors truncate max-w-[180px] ${isActive || isRouteActive ? 'text-[#18A36C] font-medium' : ''
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
          <div
            className={`hidden lg:flex flex-shrink-0 transition-transform duration-200 p-3 cursor-pointer hover:bg-gray-100 rounded ${isExpanded ? 'rotate-90' : ''
              } ${isActive ? 'text-[#18A36C]' : 'text-gray-400'}`}
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
                    currentRoute={currentRoute}
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

export function NavigableClinicMenu() {
  const [activeItem, setActiveItem] = useState<string | null>(null);
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [dynamicMenuData, setDynamicMenuData] = useState<MenuItem[]>(menuData);
  const router = useRouter();
  const pathname = usePathname();
  const { isBurgerMenuOpen } = useMenu();

  // Загрузка категорий вопросов и партнеров из API
  useEffect(() => {
    async function loadDynamicCategories() {
      try {
        const [questionRes, partnersRes] = await Promise.all([
          fetch('/api/question-categories'),
          fetch('/api/partners'),
        ]);

        const questionCategories = questionRes.ok ? await questionRes.json() : [];
        const partners = partnersRes.ok ? await partnersRes.json() : [];

        const groupedPartners = new Map<string, string>();
        for (const partner of partners as PartnerApiItem[]) {
          const slug = partner.category?.slug;
          const name = partner.category?.name;
          if (slug && name) {
            groupedPartners.set(slug, name);
          }
        }

        const partnerChildren = Array.from(groupedPartners.entries())
          .map(([slug, name]) => ({ id: slug, title: name }))
          .sort((a, b) => a.title.localeCompare(b.title, 'ru'));

        // Обновляем menuData, добавляя категории в "questions" и "partners"
        const updatedMenu = menuData.map(item => {
          if (item.id === 'questions') {
            return {
              ...item,
              children: questionCategories.map((cat: any) => ({
                id: cat.slug,
                title: cat.name,
              })),
            };
          }
          if (item.id === 'partners') {
            return {
              ...item,
              children: partnerChildren,
            };
          }
          return item;
        });

        setDynamicMenuData(updatedMenu);
      } catch (error) {
        console.error('Error loading dynamic clinic menu categories:', error);
      }
    }

    loadDynamicCategories();
  }, []);

  // Auto-expand and select based on current route
  useEffect(() => {
    const routeParts = pathname.split('/').filter(Boolean);
    if (routeParts[0] === 'clinic' && routeParts.length >= 2) {
      const sectionId = routeParts[1];
      const itemId = routeParts[2] || sectionId;

      // Set active item
      setActiveItem(itemId);

      // Expand the parent section
      setExpandedItems(new Set([sectionId]));

      // Скролл к активному элементу после небольшой задержки
      setTimeout(() => {
        const activeElement = document.querySelector(`[data-menu-item="${itemId}"]`);
        if (activeElement) {
          activeElement.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
      }, 300);
    } else if (routeParts[0] === 'clinic' && routeParts.length === 1) {
      // На главной странице клиники - сбрасываем активный пункт
      setActiveItem(null);
      setExpandedItems(new Set());
    }
  }, [pathname]);

  const handleItemClick = (itemId: string, item: MenuItem) => {
    // Обновляем activeItem только если он изменился
    if (activeItem !== itemId) {
      setActiveItem(itemId);
    }

    let categoryId = '';
    let foundItem: MenuItem | null = null;

    const findCategory = (items: MenuItem[], parentId = ''): boolean => {
      for (const menuItem of items) {
        if (menuItem.id === itemId) {
          categoryId = parentId || menuItem.id;
          foundItem = item;
          return true;
        }
        if (menuItem.children && findCategory(menuItem.children, parentId || menuItem.id)) {
          return true;
        }
      }
      return false;
    };

    findCategory(dynamicMenuData);

    if (foundItem) {
      // Специальная обработка для главной страницы "Вопросы и ответы"
      if (itemId === 'questions' && categoryId === 'questions') {
        router.push('/clinic/questions');
      }
      // Если это дочерний элемент категории вопросов
      else if (categoryId === 'questions' && categoryId !== itemId) {
        router.push(`/clinic/questions/${itemId}`);
      }
      // Если это элемент верхнего уровня (нет родителя), используем только itemId
      else if (!categoryId || categoryId === itemId) {
        router.push(`/clinic/${itemId}`);
      }
      // Если это дочерний элемент, используем оба
      else {
        router.push(`/clinic/${categoryId}/${itemId}`);
      }
    }
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
            <Building2 className="w-6 h-6 text-white" />
          </div>
          <div className="text-left flex-1 min-w-0 overflow-hidden">
            <h2 className="text-lg lg:text-xl font-semibold text-gray-800 whitespace-nowrap">Клиника</h2>
            <p className="text-xs lg:text-sm text-gray-500 mt-0.5 whitespace-nowrap overflow-hidden text-ellipsis">Выберите нужный раздел</p>
          </div>
        </div>
      </div>

      {/* Scrollable Menu Items */}
      <div className="flex-1 overflow-y-auto py-2">
        {dynamicMenuData.map((item) => (
          <MenuItemComponent
            key={item.id}
            item={item}
            level={0}
            activeItem={activeItem}
            onItemClick={onItemClickProp || handleItemClick}
            expandedItems={expandedItems}
            onToggleExpand={handleToggleExpand}
            currentRoute={pathname}
          />
        ))}
      </div>

      {/* Footer - Fixed */}
      <div className="p-3 lg:p-4 border-t border-[#E8E6E3] bg-white flex-shrink-0">
        <div className="text-center">
          <p className="text-xs text-gray-600 mb-2 lg:mb-3">Не нашли нужную информацию?</p>
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
      <div className="hidden lg:block w-72 bg-white border-r border-[#E8E6E3] shadow-lg flex-shrink-0 sticky top-[80px] h-[calc(100vh-80px)]">
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
              <Building2 className="w-6 h-6" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-80 p-0">
            <SheetHeader className="sr-only">
              <SheetTitle>Меню клиники</SheetTitle>
              <SheetDescription>Навигация по разделам клиники</SheetDescription>
            </SheetHeader>
            <MenuContent onItemClick={(itemId, item) => {
              handleItemClick(itemId, item);
              // Close the sheet after navigation (for leaf items)
              if (!item.children || item.children.length === 0) {
                setMobileMenuOpen(false);
              }
            }} />
          </SheetContent>
        </Sheet>
      </div>
    </>
  );
}