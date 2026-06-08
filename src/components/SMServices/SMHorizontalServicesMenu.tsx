'use client'

import { useState, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';
import { Button } from '../common/SMButton/SMButton';
import servicesMenuConfig from '@/config/servicesMenu.json';
import { iconMap, IconName } from '@/utils/iconMapper';

interface MenuItem {
  id: string;
  title: string;
  icon?: string;
  children?: MenuItem[];
}

interface DropdownMenuProps {
  item: MenuItem;
  activeItem: string | null;
  onItemClick: (itemId: string) => void;
}

function DropdownMenu({ item, activeItem, onItemClick }: DropdownMenuProps) {
  const [isOpen, setIsOpen] = useState(false);

  const renderSubmenu = (items: MenuItem[], level: number = 0) => {
    return items.map((subItem) => (
      <div key={subItem.id}>
        <button
          onClick={() => {
            onItemClick(subItem.id);
            setIsOpen(false);
          }}
          className={`w-full text-left px-3 md:px-4 py-1.5 md:py-2 text-xs md:text-sm hover:bg-[#F4F4F4] transition-colors ${
            activeItem === subItem.id ? 'bg-[#18A36C]/10 text-[#18A36C]' : 'text-[#212121]'
          } ${level > 0 ? 'pl-6 md:pl-8' : ''}`}
        >
          <span className="line-clamp-2">{subItem.title}</span>
        </button>
        {subItem.children && (
          <div className="bg-[#F4F4F4]/30">
            {renderSubmenu(subItem.children, level + 1)}
          </div>
        )}
      </div>
    ));
  };

  return (
    <div className="relative group">
      <Button
        variant="ghost"
        className={`flex items-center gap-1 md:gap-2 px-2 md:px-4 py-1.5 md:py-2 h-auto text-xs md:text-sm transition-all duration-200 ${
          isOpen || (item.children && item.children.some(child =>
            activeItem === child.id || (child.children && child.children.some(grandchild => activeItem === grandchild.id))
          ))
            ? 'bg-[#18A36C] text-white shadow-md'
            : 'text-[#212121] hover:bg-[#18A36C]/10 hover:text-[#18A36C]'
        }`}
        onMouseEnter={() => setIsOpen(true)}
        onMouseLeave={() => setIsOpen(false)}
        onClick={() => setIsOpen(!isOpen)}
      >
        {item.icon && (() => {
          const Icon = iconMap[item.icon as IconName];
          return Icon ? (
            <span className="flex-shrink-0">
              <Icon className="w-4 h-4" />
            </span>
          ) : null;
        })()}
        <span className="whitespace-nowrap truncate max-w-[120px] md:max-w-none">{item.title}</span>
        {item.children && (
          <ChevronDown className={`w-3 h-3 md:w-4 md:h-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
        )}
      </Button>

      {item.children && (
        <div
          className={`absolute top-full left-0 mt-1 min-w-72 md:min-w-80 max-w-sm bg-white border border-[#CACACA]/20 rounded-lg shadow-xl z-50 transition-all duration-200 ${
            isOpen ? 'opacity-100 visible translate-y-0' : 'opacity-0 invisible -translate-y-2'
          }`}
          onMouseEnter={() => setIsOpen(true)}
          onMouseLeave={() => setIsOpen(false)}
        >
          <div className="py-2 max-h-80 md:max-h-96 overflow-y-auto">
            {renderSubmenu(item.children)}
          </div>
        </div>
      )}
    </div>
  );
}

export function HorizontalServicesMenu() {
  const [activeItem, setActiveItem] = useState<string | null>(null);
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

  if (loading) {
    return (
      <div className="bg-white border-b border-[#CACACA] shadow-sm relative z-40">
        <div className="max-w-7xl mx-auto px-4">
          <div className="py-3 md:py-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse" />
              <div className="h-5 w-32 bg-gray-200 rounded animate-pulse" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border-b border-[#CACACA] shadow-sm relative z-40">
      <div className="max-w-7xl mx-auto px-4">
        <div className="py-3 md:py-4">
          <div className="mb-3 md:mb-4">
            <div className="flex items-center gap-2 md:gap-3">
              <div className="w-6 h-6 md:w-8 md:h-8 bg-[#18A36C] rounded-full flex items-center justify-center">
                <span className="text-white text-xs md:text-sm">+</span>
              </div>
              <h2 className="text-base md:text-lg text-[#212121]">{servicesMenuConfig.horizontalMenu.title}</h2>
            </div>
          </div>

          <div className="flex flex-wrap gap-1 md:gap-2">
            {menuData.map((item) => (
              <DropdownMenu
                key={item.id}
                item={item}
                activeItem={activeItem}
                onItemClick={handleItemClick}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}