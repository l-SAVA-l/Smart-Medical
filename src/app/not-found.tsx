'use client';

import { motion } from 'framer-motion';
import { Home, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/common/SMButton/SMButton';
import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <div className="max-w-2xl mx-auto text-center">
        {/* Animated 404 number */}
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="mb-8"
        >
          <span className="text-[150px] lg:text-[200px] font-bold text-[#18A36C] leading-none select-none">
            404
          </span>
        </motion.div>

        {/* Title */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-2xl lg:text-4xl text-[#2E2E2E] mb-4"
        >
          Страница не найдена
        </motion.h1>

        {/* Description */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="text-gray-600 text-lg mb-8 max-w-md mx-auto"
        >
          К сожалению, запрашиваемая страница не существует или была перемещена.
          Возможно, вы перешли по устаревшей ссылке.
        </motion.p>

        {/* Action buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12"
        >
          <Link href="/">
            <Button className="bg-[#18A36C] hover:bg-[#18A36C]/90 text-white px-8 py-4 h-auto text-lg rounded-lg transition-all duration-300">
              <Home className="w-5 h-5 mr-2" />
              На главную
            </Button>
          </Link>

          <Button
            variant="outline"
            onClick={() => window.history.back()}
            className="border-[#18A36C] text-[#18A36C] px-8 py-4 h-auto text-lg rounded-lg hover:shadow-xl hover:shadow-[#18A36C]/20"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Назад
          </Button>
        </motion.div>
      </div>
    </div>
  );
}
