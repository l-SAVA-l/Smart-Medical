'use client';

import { useState, useEffect } from 'react';
import { ChevronRight } from 'lucide-react';
import { Button } from '../common/SMButton/SMButton';
import { iconMap, IconName } from '@/utils/iconMapper';
import servicesMenuConfig from '@/config/servicesMenu.json';

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
  onItemClick: (itemId: string) => void;
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

  const handleClick = () => {
    if (hasChildren) {
      onToggleExpand(item.id);
    } else {
      onItemClick(item.id);
    }
  };

  const getItemStyles = () => {
    if (level === 0) {
      return isActive
        ? 'bg-[#18A36C] text-white shadow-md hover:bg-[#18A36C]/90 border-l-4 border-white'
        : 'text-[#212121] hover:bg-gradient-to-r hover:from-[#F4F4F4] hover:to-[#CACACA]/20 border-l-4 border-transparent hover:border-[#18A36C]/30';
    } else if (level === 1) {
      return isActive
        ? 'bg-[#18A36C]/10 text-[#18A36C] border-l-2 border-[#18A36C] shadow-sm'
        : 'text-[#212121] hover:bg-[#F4F4F4] border-l-2 border-transparent hover:border-[#CACACA]';
    } else {
      return isActive
        ? 'bg-[#18A36C]/5 text-[#18A36C]'
        : 'text-gray-600 hover:bg-gray-50 hover:text-[#212121]';
    }
  };

  const Icon = item.icon ? iconMap[item.icon as IconName] : null;

  return (
    <div className="group">
      <Button
        variant="ghost"
        className={`w-full justify-start text-left p-0 h-auto transition-all duration-200 ${getItemStyles()}`}
        onClick={handleClick}
      >
        <div
          className="flex items-center justify-between w-full py-3 px-4"
          style={{ paddingLeft: `${level * 16 + 16}px` }}
        >
          <div className="flex items-center gap-3">
            {level === 0 && Icon && (
              <div className={`flex-shrink-0 ${isActive ? 'text-white' : 'text-[#18A36C]'}`}>
                <Icon className="w-4 h-4" />
              </div>
            )}
            <span className={`leading-relaxed transition-all duration-200 ${
              level === 0 ? 'text-sm' : level === 1 ? 'text-sm' : 'text-xs'
            }`}>
              {item.title}
            </span>
          </div>
          {hasChildren && (
            <div className={`flex-shrink-0 transition-transform duration-200 ${
              isExpanded ? 'rotate-90' : ''
            } ${isActive && level === 0 ? 'text-white' : 'text-[#18A36C]'}`}>
              <ChevronRight className="w-4 h-4" />
            </div>
          )}
        </div>
      </Button>

      {hasChildren && (
        <div className={`overflow-hidden transition-all duration-300 ease-in-out ${
          isExpanded ? 'max-h-[1000px] opacity-100' : 'max-h-0 opacity-0'
        }`}>
          <div className="bg-gradient-to-r from-transparent via-[#F4F4F4]/30 to-transparent">
            {item.children!.map((child) => (
              <MenuItemComponent
                key={child.id}
                item={child}
                level={level + 1}
                activeItem={activeItem}
                onItemClick={onItemClick}
                expandedItems={expandedItems}
                onToggleExpand={onToggleExpand}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export function ServicesMenu() {
  const [activeItem, setActiveItem] = useState<string | null>(null);
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
  const [menuData, setMenuData] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Load menu data from API
  useEffect(() => {
    const fetchMenuData = async () => {
      setLoading(true);
      try {
        const response = await fetch('/api/services-menu');
        if (response.ok) {
          const data = await response.json();
          setMenuData(data.menuData || []);
        }
      } catch (error) {
        console.error('Error fetching services menu:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMenuData();
  }, []);

  const handleItemClick = (itemId: string) => {
    setActiveItem(itemId);
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

  return (
    <div className="lg:w-80 w-full bg-white lg:border-r border-[#CACACA] lg:sticky lg:top-0 lg:self-start lg:h-[100vh] overflow-y-auto">
      <div className="bg-[#18A36C] p-4 lg:p-6 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-20 h-20 bg-white rounded-full translate-x-10 -translate-y-10"></div>
          <div className="absolute bottom-0 left-0 w-16 h-16 bg-white rounded-full -translate-x-8 translate-y-8"></div>
        </div>
        <div className="relative z-10">
          <h2 className="text-white text-lg lg:text-xl mb-1 lg:mb-2">
            {servicesMenuConfig.header.title}
          </h2>
          <p className="text-white/80 text-xs lg:text-sm">
            {servicesMenuConfig.header.subtitle}
          </p>
        </div>
      </div>

      <div className="py-2">
        {loading ? (
          <div className="px-4 py-6 text-center text-sm text-gray-500">
            Загрузка меню...
          </div>
        ) : menuData.length > 0 ? (
          menuData.map((item) => (
            <MenuItemComponent
              key={item.id}
              item={item}
              level={0}
              activeItem={activeItem}
              onItemClick={handleItemClick}
              expandedItems={expandedItems}
              onToggleExpand={handleToggleExpand}
            />
          ))
        ) : (
          <div className="px-4 py-6 text-center text-sm text-gray-500">
            Услуги не найдены
          </div>
        )}
      </div>

      <div className="p-3 lg:p-4 mt-2 lg:mt-4 border-t border-[#CACACA] bg-[#F4F4F4]/50">
        <div className="text-center">
          <p className="text-xs text-gray-600 mb-2 lg:mb-3">
            {servicesMenuConfig.footer.text}
          </p>
          <Button
            size="sm"
            className="bg-[#18A36C] hover:bg-[#18A36C]/90 text-white w-full text-xs"
          >
            {servicesMenuConfig.footer.buttonText}
          </Button>
        </div>
      </div>
    </div>
  );
}
