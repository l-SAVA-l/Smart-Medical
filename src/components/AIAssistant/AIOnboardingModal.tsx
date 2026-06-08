'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X, Bot, Headphones, ArrowRight, Star } from 'lucide-react';

interface AIOnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AIOnboardingModal({ isOpen, onClose }: AIOnboardingModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100]"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ duration: 0.3 }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md max-h-[90vh] bg-white rounded-2xl shadow-2xl z-[101] overflow-hidden flex flex-col"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-[#18A36C] to-[#15905f] p-6 relative flex-shrink-0">
              <button
                onClick={onClose}
                className="absolute cursor-pointer top-4 right-4 w-8 h-8 rounded-lg bg-white/20 hover:bg-white/30 flex items-center justify-center text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
              <div className="text-center">
                <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Bot className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-white mb-2">
                  Добро пожаловать!
                </h2>
                <p className="text-white/90 text-sm">
                  Знакомство с нашим помощником
                </p>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6 overflow-y-auto flex-1">
              {/* AI Assistant Feature */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="flex gap-4"
              >
                <div className="w-12 h-12 bg-gradient-to-br from-[#18A36C] to-[#15905f] rounded-xl flex items-center justify-center flex-shrink-0">
                  <Bot className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-800 mb-1">
                    AI Помощник
                  </h3>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    Получайте мгновенные ответы на вопросы о клинике, услугах и врачах. AI помощник работает 24/7 и готов помочь вам в любое время.
                  </p>
                </div>
              </motion.div>

              {/* Arrow */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="flex justify-center"
              >
                <div className="flex items-center gap-2 text-gray-400">
                  <div className="h-px bg-gray-300 w-12" />
                  <ArrowRight className="w-5 h-5" />
                  <div className="h-px bg-gray-300 w-12" />
                </div>
              </motion.div>

              {/* Operator Feature */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6 }}
                className="flex gap-4"
              >
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Headphones className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-800 mb-1">
                    Оператор
                  </h3>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    Если вам нужна помощь живого оператора, просто переключитесь на вкладку "Оператор" в верхней части чата.
                  </p>
                </div>
              </motion.div>

              {/* Arrow */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.7 }}
                className="flex justify-center"
              >
                <div className="flex items-center gap-2 text-gray-400">
                  <div className="h-px bg-gray-300 w-12" />
                  <ArrowRight className="w-5 h-5" />
                  <div className="h-px bg-gray-300 w-12" />
                </div>
              </motion.div>

              {/* Feedback Feature */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.8 }}
                className="flex gap-4"
              >
                <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-orange-500 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Star className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-800 mb-1">
                    Оставить отзыв
                  </h3>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    После общения с оператором вы можете оставить отзыв о качестве обслуживания. Ваше мнение важно для нас!
                  </p>
                </div>
              </motion.div>

              {/* Info Box */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1 }}
                className="bg-[#18A36C]/5 border border-[#18A36C]/20 rounded-xl p-4"
              >
                <p className="text-sm text-gray-700 text-center">
                  <span className="font-semibold text-[#18A36C]">Совет:</span> Вы можете переключаться между AI помощником и оператором в любой момент!
                </p>
              </motion.div>

              {/* Button */}
              <motion.button
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.2 }}
                onClick={onClose}
                className="w-full bg-gradient-to-r from-[#18A36C] to-[#15905f] text-white py-3 px-6 rounded-xl font-semibold hover:shadow-lg transition-all duration-300 cursor-pointer"
              >
                Начать общение
              </motion.button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
