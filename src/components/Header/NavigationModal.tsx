'use client';

import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { X, ArrowRight, ChevronDown } from 'lucide-react';
import navigationConfig from '@/config/navigation.json';
import { iconMap, IconName } from '@/utils/iconMapper';

interface NavigationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (path: string) => void;
}

interface NavigationItem {
  name: string;
  path: string;
  icon?: string;
  subPages?: { name: string; path: string }[];
}

interface ServiceCategory {
  id: number;
  name: string;
  slug: string;
  icon: string | null;
}

interface ServicesMenuItem {
  id: string;
  title: string;
  icon?: string;
  description?: string;
  children?: ServicesMenuItem[];
}

export function NavigationModal({ isOpen, onClose, onNavigate }: NavigationModalProps) {
  const [serviceCategories, setServiceCategories] = useState<ServiceCategory[]>([]);
  const [servicesMenu, setServicesMenu] = useState<ServicesMenuItem[]>([]);
  const [navigationItems, setNavigationItems] = useState<NavigationItem[]>(
    navigationConfig.mainNavigation as NavigationItem[]
  );
  const [expandedCards, setExpandedCards] = useState<Set<string>>(new Set());

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Загружаем категории для специалистов
        const categoriesResponse = await fetch('/api/service-categories');
        if (categoriesResponse.ok) {
          const categoriesData: ServiceCategory[] = await categoriesResponse.json();
          setServiceCategories(categoriesData);
        }

        // Загружаем меню услуг с подкатегориями
        const servicesMenuResponse = await fetch('/api/services-menu');
        if (servicesMenuResponse.ok) {
          const servicesMenuData = await servicesMenuResponse.json();
          setServicesMenu(servicesMenuData.menuData || []);
        }
      } catch (error) {
        console.error('Error fetching navigation data:', error);
      }
    };

    if (isOpen) {
      fetchData();
    }
  }, [isOpen]);

  // Функция для преобразования ServicesMenuItem в NavigationItem subPages
  // Теперь children - это услуги, а не подкатегории
  const convertServicesMenuToSubPages = (menuItems: ServicesMenuItem[]): { name: string; path: string }[] => {
    const result: { name: string; path: string }[] = [];

    menuItems.forEach(category => {
      // Добавляем саму категорию (переход на страницу категории)
      result.push({
        name: category.title,
        path: `/services/${category.id}`,
      });

      // Добавляем услуги категории как отдельные пункты
      if (category.children && category.children.length > 0) {
        category.children.forEach(service => {
          result.push({
            name: `  └─ ${service.title}`, // Визуально показываем вложенность
            path: `/services/${service.id}`,
          });
        });
      }
    });

    return result;
  };

  useEffect(() => {
    const hasServiceCategories = serviceCategories.length > 0;
    const hasServicesMenu = servicesMenu.length > 0;

    if (!hasServiceCategories && !hasServicesMenu) {
      return;
    }

    const updatedNavigation = (navigationConfig.mainNavigation as NavigationItem[]).map(item => {
      if (item.name === 'Специалисты' && hasServiceCategories) {
        return {
          ...item,
          subPages: [
            { name: 'Все специалисты', path: '/doctors' },
            ...serviceCategories.map(category => ({
              name: category.name,
              path: `/doctors/${category.slug}`,
            })),
          ],
        };
      }

      if (item.name === 'Услуги' && hasServicesMenu) {
        return {
          ...item,
          subPages: [
            { name: 'Все услуги', path: '/services' },
            ...convertServicesMenuToSubPages(servicesMenu),
          ],
        };
      }

      return item;
    });
    setNavigationItems(updatedNavigation);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(serviceCategories), JSON.stringify(servicesMenu)]);

  const handleNavigate = (path: string) => {
    onNavigate(path);
    onClose();
  };

  const toggleCard = (itemName: string, hasSubPages: boolean) => {
    if (!hasSubPages) {
      return;
    }

    setExpandedCards(prev => {
      const newSet = new Set(prev);
      if (newSet.has(itemName)) {
        newSet.delete(itemName);
      } else {
        newSet.add(itemName);
      }
      return newSet;
    });
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-md z-[100]"
            onClick={onClose}
          />

          {/* Modal Window */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 30 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[92vw] max-w-7xl h-[90vh] bg-white rounded-3xl shadow-[0_25px_50px_-12px_rgba(0,0,0,0.25)] z-[101] overflow-hidden"
          >
            {/* Header with gradient */}
            <div className="relative bg-gradient-to-r from-[#18A36C] to-[#15905f] px-10 py-8">
              <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1vcGFjaXR5PSIwLjA1IiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-30" />
              <div className="relative flex items-center justify-between">
                <div>
                  <h2 className="text-3xl font-bold text-white mb-2">Навигация по сайту</h2>
                  <p className="text-white/90 text-base">Выберите раздел для быстрого перехода</p>
                </div>
                <button
                  onClick={onClose}
                  className="p-3 hover:bg-white/20 rounded-xl transition-all cursor-pointer group backdrop-blur-sm"
                >
                  <X className="w-7 h-7 text-white group-hover:rotate-90 transition-transform duration-300" />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="h-[calc(90vh-140px)] overflow-y-auto px-10 py-8">
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
                {navigationItems.map((item, index) => {
                  const Icon = item.icon ? iconMap[item.icon as IconName] : null;
                  const hasSubPages = item.subPages && item.subPages.length > 0;

                  return (
                    <motion.div
                      key={item.name}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.08, duration: 0.4 }}
                      className="group"
                    >
                      {/* Section Card */}
                      <div className="relative bg-white border-2 border-gray-100 rounded-2xl overflow-hidden hover:border-[#18A36C]/30 hover:shadow-xl hover:shadow-[#18A36C]/10 transition-all duration-300">
                        {/* Main Section Button */}
                        <button
                          onClick={() => hasSubPages ? toggleCard(item.name, hasSubPages) : handleNavigate(item.path)}
                          className="w-full p-6 cursor-pointer"
                        >
                          <div className="flex items-start gap-4">
                            {Icon && (
                              <div className="relative">
                                <div className="absolute inset-0 bg-[#18A36C]/20 rounded-xl blur-xl group-hover:bg-[#18A36C]/40 transition-all" />
                                <div className="relative p-4 rounded-xl bg-gradient-to-br from-[#18A36C] to-[#15905f] group-hover:scale-110 transition-transform duration-300">
                                  <Icon className="w-7 h-7 text-white" />
                                </div>
                              </div>
                            )}
                            <div className="flex-1 text-left">
                              <h3 className="text-xl font-bold text-gray-800 group-hover:text-[#18A36C] transition-colors mb-1">
                                {item.name}
                              </h3>
                              <p className="text-sm text-gray-500">
                                {hasSubPages ? `${item.subPages!.length} подразделов` : 'Перейти в раздел'}
                              </p>
                            </div>
                            {hasSubPages ? (
                              <ChevronDown className={`w-5 h-5 text-gray-400 group-hover:text-[#18A36C] transition-all flex-shrink-0 mt-1 ${expandedCards.has(item.name) ? 'rotate-180' : ''}`} />
                            ) : (
                              <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-[#18A36C] group-hover:translate-x-1 transition-all flex-shrink-0 mt-1" />
                            )}
                          </div>
                        </button>

                        {/* Subpages - Collapsible */}
                        <AnimatePresence>
                          {hasSubPages && expandedCards.has(item.name) && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                              className="border-t border-gray-100 bg-gradient-to-b from-gray-50/50 to-transparent overflow-hidden"
                            >
                              <div className="px-6 py-4">
                                <div className="space-y-1">
                                  {item.subPages!.map((subPage, subIndex) => (
                                    <motion.button
                                      key={subPage.path}
                                      initial={{ opacity: 0, x: -10 }}
                                      animate={{ opacity: 1, x: 0 }}
                                      transition={{ delay: subIndex * 0.03 }}
                                      onClick={() => handleNavigate(subPage.path)}
                                      className="w-full text-left px-4 py-2.5 text-sm text-gray-600 hover:text-[#18A36C] hover:bg-white rounded-lg transition-all cursor-pointer flex items-center justify-between group/sub"
                                    >
                                      <span className="font-medium">{subPage.name}</span>
                                      <ArrowRight className="w-4 h-4 opacity-0 group-hover/sub:opacity-100 group-hover/sub:translate-x-1 transition-all" />
                                    </motion.button>
                                  ))}
                                </div>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
