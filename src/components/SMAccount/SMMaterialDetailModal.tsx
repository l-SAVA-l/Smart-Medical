'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { CalendarDays, Sparkles, X } from 'lucide-react';
import { ImageWithFallback } from '../SMImage/ImageWithFallback';

interface Material {
  id: string;
  title: string;
  content: string;
  detailed_content?: string | null;
  image: string;
  date: string;
  dateRaw?: string;
  year: number;
}

interface MaterialDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  material: Material | null;
}

// Функция для проверки, является ли материал новым (менее месяца)
export function isNewMaterial(dateRaw?: string): boolean {
  if (!dateRaw) return false;

  const materialDate = new Date(dateRaw);
  const oneMonthAgo = new Date();
  oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

  return materialDate > oneMonthAgo;
}

export function MaterialDetailModal({ isOpen, onClose, material }: MaterialDetailModalProps) {
  const isNew = material ? isNewMaterial(material.dateRaw) : false;

  return (
    <AnimatePresence>
      {isOpen && material && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-white rounded-2xl shadow-2xl"
          >
            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-6 right-6 w-12 h-12 flex items-center justify-center rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-600 hover:text-gray-800 transition-all duration-200 hover:scale-110 z-10"
            >
              <X className="w-6 h-6" />
            </button>

            {/* Header with Gradient */}
            <div className="bg-gradient-to-r from-[#18A36C]/5 via-[#18A36C]/10 to-[#18A36C]/5 p-8 border-b border-gray-100">
              <div className="flex items-start gap-3">
                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-[#2E2E2E] mb-2">
                    {material.title}
                  </h2>
                  {isNew && (
                    <div className="flex items-center gap-2">
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-gradient-to-r from-[#18A36C] to-[#15905f] text-white text-xs font-medium rounded-full">
                        <Sparkles className="w-3 h-3" />
                        Новое
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="p-8 space-y-6">
              {/* Image */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="relative h-96 rounded-xl overflow-hidden shadow-md"
              >
                <ImageWithFallback
                  src={material.image}
                  alt={material.title}
                  className="w-full h-full object-cover"
                />
              </motion.div>

              {/* Description */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
              >
                <h3 className="text-lg font-semibold text-[#2E2E2E] mb-3 flex items-center gap-2">
                  <span className="w-1 h-6 bg-gradient-to-b from-[#18A36C] to-[#15905f] rounded-full" />
                  О материале
                </h3>
                <p className="text-gray-700 leading-relaxed">
                  {material.content}
                </p>
              </motion.div>

              {/* Detailed description */}
              {material.detailed_content && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="bg-gradient-to-br from-gray-50 to-white p-6 rounded-xl border border-gray-100"
                >
                  <h3 className="text-lg font-semibold text-[#2E2E2E] mb-3 flex items-center gap-2">
                    <span className="w-1 h-6 bg-gradient-to-b from-[#18A36C] to-[#15905f] rounded-full" />
                    Подробная информация
                  </h3>
                  <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                    {material.detailed_content}
                  </p>
                </motion.div>
              )}

              {/* Additional Info */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25 }}
              >
                <h3 className="text-lg font-semibold text-[#2E2E2E] mb-3 flex items-center gap-2">
                  <span className="w-1 h-6 bg-gradient-to-b from-[#18A36C] to-[#15905f] rounded-full" />
                  Дополнительно
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 text-gray-700 bg-gradient-to-br from-[#18A36C]/5 to-transparent p-4 rounded-xl border border-[#18A36C]/10">
                    <div className="w-12 h-12 bg-gradient-to-br from-[#18A36C] to-[#15905f] rounded-xl flex items-center justify-center shadow-md">
                      <CalendarDays className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <div className="text-sm text-gray-600">Дата публикации</div>
                      <div className="font-semibold text-[#2E2E2E]">{material.date}</div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
