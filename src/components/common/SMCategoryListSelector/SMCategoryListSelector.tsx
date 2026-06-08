'use client';

import { ChevronRight, Circle, CheckCircle2 } from 'lucide-react';

export interface CategoryOption {
  id: number;
  name: string;
  level: number;
  disabled: boolean;
  disabledReason?: string;
}

interface CategoryListSelectorProps {
  categories: CategoryOption[];
  value: string | number;
  onChange: (value: string) => void;
  placeholder?: string;
  maxHeight?: string;
  showHeader?: boolean;
  showFooter?: boolean;
}

export function CategoryListSelector({
  categories,
  value,
  onChange,
  placeholder = 'Выберите категорию',
  maxHeight = '320px',
  showHeader = true,
  showFooter = true
}: CategoryListSelectorProps) {
  const selectedId = value ? parseInt(value.toString()) : null;

  return (
    <div className="w-full border border-gray-200 rounded-xl bg-white overflow-hidden">
      {/* Header */}
      {showHeader && (
        <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
          <p className="text-sm text-gray-600">
            {selectedId
              ? categories.find(c => c.id === selectedId)?.name || placeholder
              : placeholder
            }
          </p>
        </div>
      )}

      {/* Scrollable List */}
      <div
        className="overflow-y-auto"
        style={{ maxHeight }}
      >
        {categories.map((cat) => {
          const isSelected = cat.id === selectedId;
          const isDisabled = cat.disabled;

          return (
            <div
              key={cat.id}
              onClick={() => !isDisabled && onChange(cat.id.toString())}
              className={`
                px-4 py-3 border-b border-gray-100 transition-all cursor-pointer
                ${isDisabled
                  ? 'bg-gray-50 cursor-not-allowed opacity-60'
                  : 'hover:bg-[#18A36C]/5 hover:border-l-4 hover:border-l-[#18A36C]'
                }
                ${isSelected && !isDisabled
                  ? 'bg-[#18A36C]/10 border-l-4 border-l-[#18A36C]'
                  : 'border-l-4 border-l-transparent'
                }
              `}
              style={{ paddingLeft: `${16 + cat.level * 20}px` }}
            >
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  {/* Level indicator */}
                  {cat.level > 0 && (
                    <ChevronRight className="w-3 h-3 text-gray-400 flex-shrink-0" />
                  )}

                  {/* Selection indicator */}
                  {isSelected ? (
                    <CheckCircle2 className="w-4 h-4 text-[#18A36C] flex-shrink-0" />
                  ) : (
                    <Circle className="w-4 h-4 text-gray-300 flex-shrink-0" />
                  )}

                  {/* Category name */}
                  <span className={`
                    text-sm flex-1 truncate
                    ${isDisabled ? 'text-gray-400' : 'text-gray-800'}
                    ${isSelected ? 'font-semibold text-[#18A36C]' : ''}
                  `}>
                    {cat.name}
                  </span>
                </div>

                {/* Disabled reason */}
                {isDisabled && cat.disabledReason && (
                  <span className="text-xs text-gray-400 italic flex-shrink-0">
                    {cat.disabledReason}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer hint */}
      {showFooter && (
        <div className="px-4 py-2 bg-gray-50 border-t border-gray-200">
          <p className="text-xs text-gray-500">
            Доступны только категории без подкатегорий
          </p>
        </div>
      )}
    </div>
  );
}
