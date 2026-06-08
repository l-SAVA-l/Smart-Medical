'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Info,
  X,
  Sparkles,
} from 'lucide-react';
import { cn } from '../SMUtils/SMUtils';

export type AlertType = 'success' | 'error' | 'warning' | 'info';

export interface AlertProps {
  id?: string;
  type: AlertType;
  title?: string;
  message: string;
  duration?: number;
  onClose?: () => void;
  closable?: boolean;
  className?: string;
}

const alertConfig = {
  success: {
    icon: CheckCircle2,
    colors: {
      bg: 'bg-gradient-to-br from-emerald-500 via-teal-500 to-green-600',
      iconBg: 'bg-white/20 backdrop-blur-sm',
      iconColor: 'text-white',
      titleColor: 'text-white',
      messageColor: 'text-emerald-50',
      progressBg: 'bg-white/20',
      progressFill: 'bg-white',
      glow: 'shadow-[0_0_30px_rgba(16,185,129,0.6)]',
      particles: 'from-emerald-300 to-teal-300',
    },
  },
  error: {
    icon: XCircle,
    colors: {
      bg: 'bg-gradient-to-br from-rose-500 via-red-500 to-pink-600',
      iconBg: 'bg-white/20 backdrop-blur-sm',
      iconColor: 'text-white',
      titleColor: 'text-white',
      messageColor: 'text-rose-50',
      progressBg: 'bg-white/20',
      progressFill: 'bg-white',
      glow: 'shadow-[0_0_30px_rgba(244,63,94,0.6)]',
      particles: 'from-rose-300 to-pink-300',
    },
  },
  warning: {
    icon: AlertTriangle,
    colors: {
      bg: 'bg-gradient-to-br from-amber-500 via-orange-500 to-yellow-600',
      iconBg: 'bg-white/20 backdrop-blur-sm',
      iconColor: 'text-white',
      titleColor: 'text-white',
      messageColor: 'text-amber-50',
      progressBg: 'bg-white/20',
      progressFill: 'bg-white',
      glow: 'shadow-[0_0_30px_rgba(245,158,11,0.6)]',
      particles: 'from-amber-300 to-orange-300',
    },
  },
  info: {
    icon: Info,
    colors: {
      bg: 'bg-gradient-to-br from-emerald-500 via-teal-500 to-green-600',
      iconBg: 'bg-white/20 backdrop-blur-sm',
      iconColor: 'text-white',
      titleColor: 'text-white',
      messageColor: 'text-emerald-50',
      progressBg: 'bg-white/20',
      progressFill: 'bg-white',
      glow: 'shadow-[0_0_30px_rgba(16,185,129,0.6)]',
      particles: 'from-emerald-300 to-teal-300',
    },
  },
};

export function SMAlert({
  type,
  title,
  message,
  duration = 5000,
  onClose,
  closable = true,
  className,
}: AlertProps) {
  const [progress, setProgress] = useState(100);
  const [isHovered, setIsHovered] = useState(false);
  const config = alertConfig[type];
  const Icon = config.icon;

  useEffect(() => {
    if (!duration || isHovered) return;

    const startTime = Date.now();
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const remaining = Math.max(0, 100 - (elapsed / duration) * 100);
      setProgress(remaining);

      if (remaining === 0) {
        clearInterval(interval);
        onClose?.();
      }
    }, 16);

    return () => clearInterval(interval);
  }, [duration, onClose, isHovered]);

  // Генерируем случайные частицы для анимации
  const particles = Array.from({ length: 8 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    delay: Math.random() * 2,
    duration: 2 + Math.random() * 2,
  }));

  return (
    <motion.div
      initial={{ opacity: 0, x: -100, scale: 0.9 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{
        opacity: 0,
        x: -100,
        scale: 0.9,
        transition: { duration: 0.3, ease: "easeInOut" }
      }}
      transition={{
        type: "spring",
        stiffness: 260,
        damping: 20
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={cn(
        'relative overflow-hidden rounded-2xl shadow-2xl backdrop-blur-md',
        'min-w-[360px] max-w-md pointer-events-auto',
        config.colors.bg,
        config.colors.glow,
        className
      )}
      style={{
        transform: isHovered ? 'scale(1.02)' : 'scale(1)',
        transition: 'transform 0.2s ease-out',
      }}
    >
      {/* Animated particles background */}
      <div className="absolute inset-0 opacity-20 overflow-hidden">
        {particles.map((particle) => (
          <motion.div
            key={particle.id}
            className={cn(
              'absolute w-2 h-2 rounded-full',
              `bg-gradient-to-br ${config.colors.particles}`
            )}
            initial={{
              x: `${particle.x}%`,
              y: `${particle.y}%`,
              scale: 0,
              opacity: 0,
            }}
            animate={{
              y: [
                `${particle.y}%`,
                `${particle.y - 30}%`,
                `${particle.y - 60}%`,
              ],
              scale: [0, 1, 0],
              opacity: [0, 1, 0],
            }}
            transition={{
              duration: particle.duration,
              delay: particle.delay,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
        ))}
      </div>

      {/* Gradient overlay */}
      <motion.div
        className="absolute inset-0 opacity-30"
        animate={{
          background: [
            'radial-gradient(circle at 20% 50%, rgba(255,255,255,0.3) 0%, transparent 50%)',
            'radial-gradient(circle at 80% 50%, rgba(255,255,255,0.3) 0%, transparent 50%)',
            'radial-gradient(circle at 20% 50%, rgba(255,255,255,0.3) 0%, transparent 50%)',
          ],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: 'linear',
        }}
      />

      {/* Content */}
      <div className="relative p-5 flex gap-4 items-center">
        {/* Icon with animation and glow */}
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{
            scale: 1,
            rotate: 0,
          }}
          transition={{
            type: 'spring',
            stiffness: 300,
            damping: 20,
            delay: 0.1,
          }}
          className="relative flex-shrink-0"
        >
          <motion.div
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.5, 0.8, 0.5],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
            className={cn(
              'absolute inset-0 rounded-full blur-xl',
              config.colors.iconBg
            )}
          />
          <div
            className={cn(
              'relative rounded-full p-2.5',
              config.colors.iconBg
            )}
          >
            <Icon className={cn('w-7 h-7', config.colors.iconColor)} />
          </div>
        </motion.div>

        {/* Text content */}
        <div className="flex-1">
          {title && (
            <motion.h4
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className={cn(
                'font-bold text-base mb-1.5',
                config.colors.titleColor,
                'drop-shadow-sm'
              )}
            >
              {title}
            </motion.h4>
          )}
          <motion.p
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: title ? 0.25 : 0.2 }}
            className={cn(
              'text-sm leading-relaxed font-medium',
              config.colors.messageColor
            )}
          >
            {message}
          </motion.p>
        </div>

        {/* Close button */}
        {closable && (
          <motion.button
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            transition={{ delay: 0.3 }}
            onClick={onClose}
            className={cn(
              'flex-shrink-0 rounded-lg cursor-pointer p-1.5 transition-all duration-200',
              'hover:bg-white/20 backdrop-blur-sm',
              config.colors.iconColor
            )}
            aria-label="Закрыть"
          >
            <X className="w-5 h-5" />
          </motion.button>
        )}
      </div>

      {/* Progress bar */}
      {duration && (
        <div className={cn('h-1.5', config.colors.progressBg)}>
          <motion.div
            className={cn(
              'h-full relative overflow-hidden',
              config.colors.progressFill
            )}
            initial={{ width: '100%' }}
            animate={{ width: isHovered ? '100%' : `${progress}%` }}
            transition={{ duration: 0.1, ease: 'linear' }}
          >
            {/* Animated shine on progress bar */}
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent"
              animate={{
                x: ['-100%', '200%'],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: 'linear',
              }}
            />
          </motion.div>
        </div>
      )}

      {/* Shine effect on hover */}
      <AnimatePresence>
        {isHovered && (
          <motion.div
            initial={{ x: '-100%', opacity: 0 }}
            animate={{ x: '100%', opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6, ease: 'easeInOut' }}
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
            style={{ pointerEvents: 'none' }}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
}
