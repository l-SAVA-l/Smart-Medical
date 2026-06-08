'use client';

import { motion } from 'framer-motion';

interface MenuSkeletonProps {
  itemCount?: number;
  showHeader?: boolean;
  showFooter?: boolean;
  headerIcon?: React.ReactNode;
}

function SkeletonPulse({ className = '', style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <motion.div
      className={`bg-gray-200 rounded ${className}`}
      style={style}
      animate={{ opacity: [0.5, 1, 0.5] }}
      transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
    />
  );
}

// Предопределённые ширины для скелетонов (чтобы избежать hydration mismatch)
const SKELETON_WIDTHS = ['55%', '65%', '70%', '60%', '75%', '58%', '68%', '62%'];

export function MenuItemSkeleton({ hasIcon = true, index = 0 }: { hasIcon?: boolean; index?: number }) {
  // Используем фиксированную ширину из массива вместо Math.random()
  const width = SKELETON_WIDTHS[index % SKELETON_WIDTHS.length];

  return (
    <div className="px-2 mb-1">
      <div className="flex items-center gap-3 px-4 py-3 rounded-lg">
        {hasIcon && <SkeletonPulse className="w-4 h-4 rounded flex-shrink-0" />}
        <SkeletonPulse className="h-4 flex-1" style={{ width }} />
      </div>
    </div>
  );
}

export function MenuHeaderSkeleton({ icon }: { icon?: React.ReactNode }) {
  return (
    <div className="p-4 lg:p-6 border-b border-gray-100 bg-gradient-to-r from-white to-gray-50">
      <div className="flex items-center gap-3">
        {icon ? (
          <div className="w-12 h-12 bg-gradient-to-br from-[#18A36C] to-[#15905f] rounded-xl flex items-center justify-center flex-shrink-0 shadow-md">
            {icon}
          </div>
        ) : (
          <SkeletonPulse className="w-12 h-12 rounded-xl flex-shrink-0" />
        )}
        <div className="flex-1">
          <SkeletonPulse className="h-5 w-32 mb-2" />
          <SkeletonPulse className="h-3 w-48" />
        </div>
      </div>
    </div>
  );
}

export function MenuFooterSkeleton() {
  return (
    <div className="p-3 lg:p-4 mt-2 lg:mt-4 border-t border-[#E8E6E3] bg-white">
      <div className="text-center">
        <SkeletonPulse className="h-3 w-40 mx-auto mb-3" />
        <SkeletonPulse className="h-8 w-full rounded-lg" />
      </div>
    </div>
  );
}

export function MenuSkeleton({
  itemCount = 8,
  showHeader = true,
  showFooter = true,
  headerIcon
}: MenuSkeletonProps) {
  return (
    <div className="bg-white flex flex-col h-full">
      {showHeader && <MenuHeaderSkeleton icon={headerIcon} />}

      <div className="py-2 flex-1">
        {Array.from({ length: itemCount }).map((_, index) => (
          <MenuItemSkeleton key={index} hasIcon={true} index={index} />
        ))}
      </div>

      {showFooter && <MenuFooterSkeleton />}
    </div>
  );
}

export function MobileMenuSkeleton({ itemCount = 6 }: { itemCount?: number }) {
  return (
    <div className="bg-white h-full">
      <div className="p-4 border-b border-gray-100">
        <SkeletonPulse className="h-6 w-32 mb-2" />
        <SkeletonPulse className="h-4 w-48" />
      </div>
      <div className="py-4 px-2">
        {Array.from({ length: itemCount }).map((_, index) => (
          <MenuItemSkeleton key={index} index={index} />
        ))}
      </div>
    </div>
  );
}
