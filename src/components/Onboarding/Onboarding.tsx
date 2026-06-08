'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '../common/SMDialog/SMDialog';
import { Button } from '../common/SMButton/SMButton';
import {
  ChevronLeft,
  ChevronRight,
  X,
  Heart,
  Menu,
  Bot,
  Search,
  Star,
  MessageSquare,
  Smartphone,
  Monitor
} from 'lucide-react';
import onboardingConfig from '@/config/onboardingConfig.json';

interface OnboardingProps {
  forceShow?: boolean;
  onComplete?: () => void;
}

type SlideIcon = 'heart' | 'menu' | 'bot' | 'search' | 'star' | 'message';

interface Slide {
  id: string;
  title: string;
  content: string;
  icon: SlideIcon;
}

const COOKIE_NAME = onboardingConfig.cookieName;
const COOKIE_EXPIRE_DAYS = onboardingConfig.cookieExpireDays;
const COOKIE_CONSENT_KEY = 'cookie-consent-accepted';

// Cookie utilities
const setCookie = (name: string, value: string, days: number) => {
  const expires = new Date();
  expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
  document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/`;
};

const getCookie = (name: string): string | null => {
  const nameEQ = `${name}=`;
  const ca = document.cookie.split(';');
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) === ' ') c = c.substring(1);
    if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length);
  }
  return null;
};

// Check if device is mobile/tablet
const useIsMobile = () => {
  const [isMobile, setIsMobile] = useState<boolean | null>(null);

  useEffect(() => {
    const checkMobile = () => {
      const width = window.innerWidth;
      // Consider mobile/tablet if width < 1024px
      setIsMobile(width < 1024);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return isMobile;
};

const getIconComponent = (icon: SlideIcon, className: string = 'w-12 h-12') => {
  switch (icon) {
    case 'heart':
      return <Heart className={className} />;
    case 'menu':
      return <Menu className={className} />;
    case 'bot':
      return <Bot className={className} />;
    case 'search':
      return <Search className={className} />;
    case 'star':
      return <Star className={className} />;
    case 'message':
      return <MessageSquare className={className} />;
    default:
      return <Heart className={className} />;
  }
};

const SlideIllustration = ({ slide, isMobile }: { slide: Slide; isMobile: boolean }) => {
  switch (slide.id) {
    case 'welcome':
      return (
        <div className="w-full h-48 bg-gradient-to-br from-[#18A36C] to-[#15905f] rounded-2xl flex items-center justify-center relative overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-4 left-4 w-16 h-16 bg-white rounded-full" />
            <div className="absolute bottom-8 right-8 w-24 h-24 bg-white rounded-full" />
            <div className="absolute top-1/2 right-4 w-12 h-12 bg-white rounded-full" />
          </div>
          <div className="text-center text-white z-10">
            <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3">
              <Heart className="w-10 h-10" />
            </div>
            <h3 className="text-lg font-medium">Doctor Family</h3>
            <p className="text-sm text-white/80 mt-1">Ваше здоровье - наша забота</p>
          </div>
        </div>
      );

    case 'menu':
      return (
        <div className="w-full h-48 bg-gray-100 rounded-2xl relative border border-gray-200 overflow-hidden">
          {/* Phone frame */}
          <div className="absolute inset-2 bg-white rounded-xl shadow-inner overflow-hidden">
            {/* Status bar */}
            <div className="bg-gray-50 px-3 py-1.5 flex items-center justify-between border-b border-gray-100">
              <span className="text-[10px] text-gray-500">9:41</span>
              <span className="text-[10px] text-gray-500">100%</span>
            </div>
            {/* Header */}
            <div className="bg-white px-3 py-2 flex items-center justify-between border-b border-gray-100">
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 bg-[#18A36C] rounded-full" />
                <span className="text-[10px] text-[#18A36C] font-medium">DOCTOR FAMILY</span>
              </div>
            </div>
            {/* Menu button highlight */}
            <div className="absolute top-16 left-3">
              <div className="relative">
                <div className="w-10 h-10 bg-[#18A36C] rounded-full flex items-center justify-center shadow-lg animate-pulse">
                  <Menu className="w-5 h-5 text-white" />
                </div>
                <div className="absolute -right-2 -bottom-1 bg-[#18A36C] text-white text-[8px] px-1.5 py-0.5 rounded-full">
                  Меню
                </div>
              </div>
            </div>
          </div>
        </div>
      );

    case 'ai-assistant':
      return (
        <div className="w-full h-48 bg-gray-100 rounded-2xl relative border border-gray-200 overflow-hidden">
          <div className="absolute inset-2 bg-white rounded-xl shadow-inner">
            {/* Content placeholder */}
            <div className="p-3 space-y-2">
              <div className="h-3 bg-gray-200 rounded w-3/4" />
              <div className="h-3 bg-gray-200 rounded w-1/2" />
              <div className="h-20 bg-gray-100 rounded mt-4" />
            </div>
            {/* AI button highlight */}
            <div className="absolute bottom-3 right-3">
              <div className="relative">
                <div className="w-12 h-12 bg-gradient-to-br from-[#18A36C] to-[#15905f] rounded-full flex items-center justify-center shadow-lg animate-bounce">
                  <Bot className="w-6 h-6 text-white" />
                </div>
                <div className="absolute -left-8 -top-1 bg-[#18A36C] text-white text-[8px] px-1.5 py-0.5 rounded-full whitespace-nowrap">
                  AI помощник
                </div>
              </div>
            </div>
          </div>
        </div>
      );

    case 'search':
      return (
        <div className="w-full h-48 bg-gray-100 rounded-2xl relative border border-gray-200 overflow-hidden">
          <div className="absolute inset-2 bg-white rounded-xl shadow-inner">
            {/* Header with search */}
            <div className="bg-white px-3 py-2 flex items-center justify-between border-b border-gray-100">
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 bg-[#18A36C] rounded-full" />
                <span className="text-[10px] text-[#18A36C] font-medium">DOCTOR FAMILY</span>
              </div>
              <div className="relative">
                <div className="w-8 h-8 bg-[#18A36C]/10 rounded-full flex items-center justify-center animate-pulse">
                  <Search className="w-4 h-4 text-[#18A36C]" />
                </div>
                <div className="absolute -left-10 top-1/2 -translate-y-1/2 bg-[#18A36C] text-white text-[8px] px-1.5 py-0.5 rounded-full">
                  Поиск
                </div>
              </div>
            </div>
            {/* Search results placeholder */}
            <div className="p-3 space-y-2">
              <div className="h-8 bg-gray-50 rounded-lg border border-gray-200 flex items-center px-2">
                <Search className="w-3 h-3 text-gray-400 mr-2" />
                <span className="text-[10px] text-gray-400">Стоматология...</span>
              </div>
              <div className="space-y-1.5 mt-2">
                <div className="h-6 bg-gray-100 rounded" />
                <div className="h-6 bg-gray-100 rounded" />
              </div>
            </div>
          </div>
        </div>
      );

    case 'review':
      return (
        <div className="w-full h-48 bg-gradient-to-br from-amber-400 to-amber-500 rounded-2xl flex items-center justify-center relative overflow-hidden">
          <div className="absolute inset-0 opacity-20">
            <Star className="absolute top-4 left-8 w-8 h-8 text-white" />
            <Star className="absolute bottom-8 right-4 w-12 h-12 text-white" />
            <Star className="absolute top-12 right-12 w-6 h-6 text-white" />
          </div>
          <div className="text-center text-white z-10">
            <div className="flex justify-center gap-1 mb-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <Star key={i} className="w-8 h-8 fill-white" />
              ))}
            </div>
            <h3 className="text-lg font-medium">Оставить отзыв</h3>
            <p className="text-sm text-white/80 mt-1">Поделитесь своим опытом</p>
          </div>
        </div>
      );

    case 'chief-doctor':
      return (
        <div className="w-full h-48 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center relative overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-4 right-4 w-20 h-20 bg-white rounded-full" />
            <div className="absolute bottom-4 left-4 w-16 h-16 bg-white rounded-full" />
          </div>
          <div className="text-center text-white z-10">
            <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3">
              <MessageSquare className="w-10 h-10" />
            </div>
            <h3 className="text-lg font-medium">Главный врач</h3>
            <p className="text-sm text-white/80 mt-1">Личный кабинет → Связь с врачом</p>
          </div>
        </div>
      );

    default:
      return (
        <div className="w-full h-48 bg-[#18A36C] rounded-2xl flex items-center justify-center">
          <div className="text-center text-white">
            <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3">
              {getIconComponent(slide.icon, 'w-10 h-10')}
            </div>
          </div>
        </div>
      );
  }
};

export function Onboarding({ forceShow = false, onComplete }: OnboardingProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isMounted, setIsMounted] = useState(false);
  const isMobile = useIsMobile();

  // Prevent hydration mismatch
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Get slides based on device type
  const slides: Slide[] = isMobile
    ? (onboardingConfig.mobile.slides as Slide[])
    : (onboardingConfig.desktop.slides as Slide[]);

  useEffect(() => {
    if (!isMounted) return; // Wait for mount
    if (isMobile === null) return; // Wait for device detection

    // Check if user has seen onboarding
    const hasSeenOnboarding = getCookie(COOKIE_NAME);

    if (forceShow || !hasSeenOnboarding) {
      // Check if cookie consent was handled (accepted or closed)
      const cookieConsentHandled = localStorage.getItem(COOKIE_CONSENT_KEY);

      if (cookieConsentHandled) {
        // Cookie consent already handled, show onboarding immediately
        const timer = setTimeout(() => setIsOpen(true), 500);
        return () => clearTimeout(timer);
      } else {
        // Poll for cookie consent using interval
        const intervalId = setInterval(() => {
          const cookieConsentHandledNow = localStorage.getItem(COOKIE_CONSENT_KEY);
          if (cookieConsentHandledNow) {
            // Cookie consent handled, clear interval and show onboarding
            clearInterval(intervalId);
            setTimeout(() => setIsOpen(true), 500);
          }
        }, 1000); // Check every second

        // Cleanup interval on unmount
        return () => clearInterval(intervalId);
      }
    }
  }, [isMobile, forceShow, isMounted]);

  const handleClose = () => {
    setIsOpen(false);
    setCurrentSlide(0);
    // Mark as seen
    setCookie(COOKIE_NAME, 'true', COOKIE_EXPIRE_DAYS);
    onComplete?.();
  };

  const handleSkip = () => {
    handleClose();
  };

  const nextSlide = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(currentSlide + 1);
    }
  };

  const prevSlide = () => {
    if (currentSlide > 0) {
      setCurrentSlide(currentSlide - 1);
    }
  };

  const handleFinish = () => {
    handleClose();
  };

  // Don't render anything until mounted to avoid hydration mismatch
  if (!isMounted || isMobile === null) return null;

  const isFirstSlide = currentSlide === 0;
  const isLastSlide = currentSlide === slides.length - 1;
  const currentSlideData = slides[currentSlide];

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md mx-auto p-0 overflow-hidden border-0 shadow-2xl rounded-2xl" hideCloseButton>
        <DialogTitle className="sr-only">Обучение по использованию сайта</DialogTitle>
        <DialogDescription className="sr-only">
          Руководство по основным функциям сайта Doctor Family
        </DialogDescription>

        <div className="relative bg-white">
          {/* Header with progress and close */}
          <div className="flex items-center justify-between p-4 border-b border-gray-100">
            {/* Progress dots */}
            <div className="flex gap-1.5">
              {slides.map((_, index) => (
                <div
                  key={index}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    index === currentSlide
                      ? 'bg-[#18A36C] w-6'
                      : index < currentSlide
                        ? 'bg-[#18A36C]/50 w-1.5'
                        : 'bg-gray-200 w-1.5'
                  }`}
                />
              ))}
            </div>

            {/* Skip & Close buttons */}
            <div className="flex items-center gap-2">
              {!isLastSlide && (
                <button
                  onClick={handleSkip}
                  className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
                >
                  {onboardingConfig.buttons.skip}
                </button>
              )}
              <button
                onClick={handleClose}
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
              >
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>
          </div>

          {/* Slide content */}
          <AnimatePresence mode="wait">
            <motion.div
              key={currentSlide}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="p-6"
            >
              {/* Illustration */}
              <div className="mb-6">
                <SlideIllustration slide={currentSlideData} isMobile={isMobile} />
              </div>

              {/* Text content */}
              <div className="text-center space-y-3">
                <h2 className="text-xl font-semibold text-gray-800">
                  {currentSlideData.title}
                </h2>
                <p className="text-sm text-gray-600 leading-relaxed">
                  {currentSlideData.content}
                </p>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Navigation */}
          <div className="p-4 pt-0">
            <div className="flex items-center justify-between">
              <Button
                variant="outline"
                size="sm"
                onClick={prevSlide}
                disabled={isFirstSlide}
                className={`flex items-center gap-1 px-4 ${
                  isFirstSlide ? 'opacity-0 pointer-events-none' : 'hover:border-[#18A36C] hover:text-[#18A36C]'
                }`}
              >
                <ChevronLeft className="w-4 h-4" />
                {onboardingConfig.buttons.back}
              </Button>

              {/* Page indicator */}
              <span className="text-xs text-gray-400">
                {currentSlide + 1} / {slides.length}
              </span>

              {isLastSlide ? (
                <Button
                  size="sm"
                  onClick={handleFinish}
                  className="bg-[#18A36C] hover:bg-[#18A36C]/90 text-white px-6"
                >
                  {onboardingConfig.buttons.finish}
                </Button>
              ) : (
                <Button
                  size="sm"
                  onClick={nextSlide}
                  className="bg-[#18A36C] hover:bg-[#18A36C]/90 text-white flex items-center gap-1 px-4"
                >
                  {onboardingConfig.buttons.next}
                  <ChevronRight className="w-4 h-4" />
                </Button>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Export a hook for manually triggering onboarding
export function useOnboarding() {
  const resetOnboarding = () => {
    document.cookie = `${COOKIE_NAME}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
  };

  return { resetOnboarding };
}
