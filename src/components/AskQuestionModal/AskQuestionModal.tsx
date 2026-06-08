'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronLeft, ChevronRight, Bot, MessageCircle, Headphones } from 'lucide-react';
import { Button } from '../common/SMButton/SMButton';

interface AskQuestionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete?: () => void;
}

const slides = [
  {
    id: 1,
    icon: Bot,
    title: 'У нас есть AI-помощник',
    description: 'Наш умный помощник готов ответить на ваши вопросы о медицинских услугах, записи на приём и работе клиники.',
    highlight: 'Быстро и удобно',
  },
  {
    id: 2,
    icon: MessageCircle,
    title: 'Задайте вопрос — получите ответ',
    description: 'Просто опишите вашу ситуацию или задайте интересующий вопрос. AI-помощник проанализирует запрос и предоставит развёрнутый ответ.',
    highlight: 'Мгновенные ответы',
  },
  {
    id: 3,
    icon: Headphones,
    title: 'Нужен живой оператор?',
    description: 'Если вам требуется консультация специалиста или помощь в сложном вопросе — переключитесь на вкладку "Оператор" в нашем помощнике.',
    highlight: 'Всегда на связи',
  },
];

export function AskQuestionModal({ isOpen, onClose, onComplete }: AskQuestionModalProps) {
  const [currentSlide, setCurrentSlide] = useState(0);

  const handleClose = () => {
    setCurrentSlide(0);
    onClose();
  };

  const handleNext = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(currentSlide + 1);
    } else {
      // На последнем слайде - завершаем
      if (onComplete) {
        onComplete();
      }
      handleClose();
    }
  };

  const handlePrev = () => {
    if (currentSlide > 0) {
      setCurrentSlide(currentSlide - 1);
    }
  };

  const handleSkip = () => {
    if (onComplete) {
      onComplete();
    }
    handleClose();
  };

  const handleOpenAI = () => {
    // Отправляем событие для открытия AI помощника на вкладке "AI"
    const event = new CustomEvent('openAIAssistant', {
      detail: { tab: 'ai' }
    });
    window.dispatchEvent(event);
    handleClose();
  };

  const handleOpenOperator = () => {
    // Отправляем событие для открытия AI помощника на вкладке "Оператор"
    const event = new CustomEvent('openAIAssistant', {
      detail: { tab: 'operator' }
    });
    window.dispatchEvent(event);
    handleClose();
  };

  if (!isOpen) return null;

  const slide = slides[currentSlide];
  const Icon = slide.icon;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="relative z-10 w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden"
          >
            {/* Close button */}
            <button
              onClick={handleClose}
              className="absolute cursor-pointer top-4 right-4 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors z-10"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Content */}
            <div className="p-8 pt-12">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentSlide}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                  className="text-center"
                >
                  {/* Icon */}
                  <div className="w-20 h-20 bg-gradient-to-br from-[#18A36C] to-[#15905f] rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                    <Icon className="w-10 h-10 text-white" />
                  </div>

                  {/* Title */}
                  <h2 className="text-2xl font-semibold text-[#2E2E2E] mb-4">
                    {slide.title}
                  </h2>

                  {/* Description */}
                  <p className="text-gray-600 leading-relaxed mb-6">
                    {slide.description}
                  </p>

                  {/* Highlight */}
                  <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#18A36C]/10 text-[#18A36C] rounded-full text-sm font-medium">
                    {slide.highlight}
                  </div>
                </motion.div>
              </AnimatePresence>

              {/* Dots indicator */}
              <div className="flex justify-center gap-2 mt-8 mb-6">
                {slides.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentSlide(index)}
                    className={`h-2 rounded-full transition-all duration-300 ${index === currentSlide
                        ? 'w-8 bg-[#18A36C]'
                        : 'w-2 bg-gray-300 hover:bg-gray-400'
                      }`}
                  />
                ))}
              </div>

              {/* Navigation buttons */}
              <div className="flex items-center justify-between gap-4">
                {currentSlide < slides.length - 1 ? (
                  <Button
                    variant="ghost"
                    onClick={handleSkip}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    Пропустить
                  </Button>
                ) : (
                  <div></div>
                )}

                <div className="flex gap-2">
                  {currentSlide > 0 && (
                    <Button
                      variant="outline"
                      onClick={handlePrev}
                      className="border-2 border-[#E8E6E3] hover:border-[#18A36C] hover:text-[#18A36C]"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </Button>
                  )}
                  {currentSlide < slides.length - 1 ? (
                    <Button
                      onClick={handleNext}
                      className="bg-[#18A36C] hover:bg-[#15905f] text-white px-6"
                    >
                      Далее
                      <ChevronRight className="w-4 h-4 ml-1" />
                    </Button>
                  ) : (
                    <div className="flex flex-col sm:flex-row gap-2">
                      <Button
                        onClick={handleOpenAI}
                        variant="outline"
                        className="border-[#18A36C] text-[#18A36C] hover:shadow-lg hover:shadow-[#18A36C]/20 cursor-pointer"
                      >
                        <Bot className="w-4 h-4 mr-2" />
                        AI Помощник
                      </Button>
                      <Button
                        onClick={handleOpenOperator}
                        className="bg-[#18A36C] hover:bg-[#15905f] text-white px-6 cursor-pointer"
                      >
                        <Headphones className="w-4 h-4 mr-2" />
                        Оператор
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
