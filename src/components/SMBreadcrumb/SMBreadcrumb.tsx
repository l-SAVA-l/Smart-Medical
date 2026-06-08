'use client';

import { ChevronRight, Home, Menu, ChevronDown } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { usePathname } from 'next/navigation';
import { useState, useRef, useEffect } from 'react';
import { generateBreadcrumbsFromUrl } from '@/utils/breadcrumbConfig';

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbProps {
  items?: BreadcrumbItem[]; // Теперь опциональный
}

export function Breadcrumb({ items: customItems }: BreadcrumbProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Генерируем breadcrumbs из URL, если не переданы кастомные
  const items = customItems || generateBreadcrumbsFromUrl(pathname);

  // Закрываем dropdown при клике вне его
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  // Формируем полный путь навигации
  const allItems = [
    { label: 'Главная', href: '/' },
    ...items
  ];

  const currentPage = items.length > 0 ? items[items.length - 1].label : 'Главная';

  const handleNavigate = (href?: string) => {
    if (href) {
      router.push(href);
      setIsOpen(false);
    }
  };

  return (
    <div className="bg-white border-b border-[#CACACA]">
      <div className="px-4 lg:px-8">
        <div className="max-w-4xl lg:max-w-6xl mx-auto">
          <nav className="h-14 flex items-center justify-between text-sm">
            {/* Левая часть - Текущая страница */}
            <div className="flex items-center gap-2 min-w-0 flex-1">
              <Home className="w-4 h-4 text-[#18A36C] shrink-0" />
              <span className="text-[#2E2E2E] font-medium truncate">{currentPage}</span>
            </div>

            {/* Правая часть - Кнопка меню навигации */}
            <div className="relative ml-4 cursor-pointer" ref={dropdownRef}>
              <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center cursor-pointer gap-2 px-4 py-2 text-[#212121] hover:text-[#18A36C] hover:bg-[#18A36C]/5 rounded-lg transition-all border border-[#CACACA] hover:border-[#18A36C]"
              >
                <Menu className="w-4 h-4 cursor-pointer" />
                <span className="hidden sm:inline">Навигация</span>
                <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* Выпадающее меню */}
              {isOpen && (
                <div className="absolute right-0 mt-2 w-72 bg-white border border-[#CACACA] rounded-lg shadow-xl z-50 overflow-hidden">
                  <div className="py-2">
                    <div className="px-4 py-2 text-xs text-gray-500 font-medium uppercase">
                      Путь навигации
                    </div>
                    {allItems.map((item, index) => {
                      const isLast = index === allItems.length - 1;
                      const isCurrent = isLast;

                      return (
                        <div key={index}>
                          <button
                            onClick={() => handleNavigate(item.href)}
                            disabled={!item.href || isCurrent}
                            className={`w-full text-left px-4 py-3 flex items-center cursor-pointer gap-3 transition-colors ${isCurrent
                              ? 'bg-[#18A36C]/10 text-[#18A36C] cursor-default'
                              : 'hover:bg-gray-50 text-[#212121] hover:text-[#18A36C]'
                              }`}
                          >
                            {/* Индикатор уровня */}
                            <div className="flex items-center gap-2 min-w-0 flex-1">
                              <div
                                className="h-full flex items-center"
                                style={{ paddingLeft: `${index * 12}px` }}
                              >
                                {index === 0 ? (
                                  <Home className="w-4 h-4 shrink-0" />
                                ) : (
                                  <ChevronRight className="w-3 h-3 text-gray-400 shrink-0" />
                                )}
                              </div>
                              <span className="truncate">{item.label}</span>
                            </div>

                            {/* Индикатор текущей страницы */}
                            {isCurrent && (
                              <div className="w-2 h-2 bg-[#18A36C] rounded-full shrink-0" />
                            )}
                          </button>
                          {!isLast && <div className="border-b border-gray-100 mx-4" />}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </nav>
        </div>
      </div>
    </div>
  );
}