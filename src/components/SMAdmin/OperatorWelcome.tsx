'use client';

import { useRouter } from 'next/navigation';
import { MessagesSquare, ArrowRight, Shield, Sparkles } from 'lucide-react';
import { Button } from '../common/SMButton/SMButton';
import { motion } from 'framer-motion';

export function OperatorWelcome() {
  const router = useRouter();

  return (
    <div className="min-h-[calc(100vh-8rem)] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-2xl w-full"
      >
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* Header with gradient */}
          <div className="bg-gradient-to-br from-[#18A36C] to-[#15905f] p-8 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full -ml-24 -mb-24" />

            <div className="relative z-10">
              <div className="flex items-center justify-center mb-6">
                <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                  <Shield className="w-10 h-10 text-white" />
                </div>
              </div>
              <h1 className="text-3xl md:text-4xl font-bold text-center mb-3">
                Добро пожаловать в админ-панель!
              </h1>
              <p className="text-white/90 text-center text-lg">
                Вы вошли как оператор
              </p>
            </div>
          </div>

          {/* Content */}
          <div className="p-8">
            <div className="space-y-6">
              {/* Info card */}
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-100">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center">
                      <Sparkles className="w-6 h-6 text-white" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">
                      Ваша роль и возможности
                    </h3>
                    <p className="text-gray-600 leading-relaxed">
                      Как оператор, вы имеете доступ к разделу <strong>чата</strong>, где можете
                      отвечать на вопросы пациентов и помогать им с их запросами в режиме реального времени.
                    </p>
                  </div>
                </div>
              </div>

              {/* Chat access card */}
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6 border border-green-100">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 bg-[#18A36C] rounded-lg flex items-center justify-center flex-shrink-0">
                    <MessagesSquare className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800">
                      Раздел чата
                    </h3>
                    <p className="text-sm text-gray-600">
                      Управляйте сообщениями пациентов
                    </p>
                  </div>
                </div>

                <Button
                  onClick={() => router.push('/admin/chat')}
                  className="w-full bg-[#18A36C] hover:bg-[#15905f] text-white font-medium py-3 rounded-lg transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-[#18A36C]/20 flex items-center justify-center gap-2"
                >
                  Перейти в чат
                  <ArrowRight className="w-5 h-5" />
                </Button>
              </div>

              {/* Help text */}
              <div className="text-center pt-4">
                <p className="text-sm text-gray-500">
                  Если у вас есть вопросы по работе с системой,<br />
                  обратитесь к администратору или главному врачу
                </p>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
