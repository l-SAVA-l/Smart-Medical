"use client";

import { AnimatePresence, motion } from 'framer-motion';
import { DollarSign, Briefcase, Clock, CheckCircle2, Phone, Mail, X, Gift } from 'lucide-react';
import { useContacts } from '@/hooks/useContacts';

interface Vacancy {
  id: number;
  name: string;
  category: string;
  description: string;
  payment: number;
  experience: number;
  requirements: string;
}

interface VacancyModalProps {
  vacancy: Vacancy | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function VacancyModal({ vacancy, open, onOpenChange }: VacancyModalProps) {
  const { contacts } = useContacts();

  if (!vacancy) return null;

  // Разбираем требования на массив
  const requirementsList = vacancy.requirements.split('\n').filter(r => r.trim());

  // Подготавливаем контактные данные
  const phoneNumber = contacts?.phone_number || '+375(29)161-01-01';
  const email = contacts?.email || 'smartmedical.by@gmail.com';
  const phoneLink = phoneNumber.replace(/[^\d+]/g, '');
  const phoneDisplay = phoneNumber;

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => onOpenChange(false)}
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto bg-white rounded-2xl shadow-2xl"
          >
            {/* Close Button */}
            <button
              onClick={() => onOpenChange(false)}
              className="absolute top-6 right-6 w-12 h-12 flex items-center justify-center rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-600 hover:text-gray-800 transition-all duration-200 hover:scale-110 z-10"
            >
              <X className="w-6 h-6" />
            </button>

            {/* Header with Gradient */}
            <div className="bg-gradient-to-r from-[#18A36C]/5 via-[#18A36C]/10 to-[#18A36C]/5 p-8 border-b border-gray-100">
              <div className="flex items-start gap-3">
                <div className="w-14 h-14 bg-gradient-to-br from-[#18A36C] to-[#15905f] rounded-xl flex items-center justify-center shadow-md flex-shrink-0">
                  <Briefcase className="w-7 h-7 text-white" />
                </div>
                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-[#2E2E2E] mb-2">
                    {vacancy.name}
                  </h2>
                  <span className="inline-block px-3 py-1 bg-gradient-to-r from-[#18A36C]/10 to-[#18A36C]/5 text-[#18A36C] text-sm font-medium rounded-full border border-[#18A36C]/20">
                    {vacancy.category}
                  </span>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="p-8 space-y-6">
              {/* Quick Info Cards */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="grid grid-cols-2 gap-4"
              >
                <div className="flex items-center gap-3 p-4 bg-gradient-to-br from-[#18A36C]/5 to-transparent rounded-xl border border-[#18A36C]/10 shadow-sm">
                  <div className="w-12 h-12 bg-gradient-to-br from-[#18A36C] to-[#15905f] rounded-xl flex items-center justify-center shadow-md">
                    <DollarSign className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">Зарплата</div>
                    <div className="font-bold text-[#2E2E2E]">{vacancy.payment} BYN</div>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-4 bg-gradient-to-br from-[#18A36C]/5 to-transparent rounded-xl border border-[#18A36C]/10 shadow-sm">
                  <div className="w-12 h-12 bg-gradient-to-br from-[#18A36C] to-[#15905f] rounded-xl flex items-center justify-center shadow-md">
                    <Clock className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">Опыт работы</div>
                    <div className="font-bold text-[#2E2E2E]">
                      {vacancy.experience} {vacancy.experience === 1 ? 'год' : vacancy.experience < 5 ? 'года' : 'лет'}
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Description */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
              >
                <h3 className="text-lg font-semibold text-[#2E2E2E] mb-3 flex items-center gap-2">
                  <span className="w-1 h-6 bg-gradient-to-b from-[#18A36C] to-[#15905f] rounded-full" />
                  Описание вакансии
                </h3>
                <p className="text-gray-700 leading-relaxed">
                  {vacancy.description}
                </p>
              </motion.div>

              {/* Requirements */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-gradient-to-br from-gray-50 to-white p-6 rounded-xl border border-gray-100"
              >
                <h3 className="text-lg font-semibold text-[#2E2E2E] mb-4 flex items-center gap-2">
                  <span className="w-1 h-6 bg-gradient-to-b from-[#18A36C] to-[#15905f] rounded-full" />
                  Требования
                </h3>
                <ul className="space-y-3">
                  {requirementsList.map((req, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <CheckCircle2 className="w-5 h-5 text-[#18A36C] mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700">{req}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>

              {/* What We Offer */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25 }}
                className="bg-gradient-to-br from-[#18A36C]/5 to-transparent p-6 rounded-xl border border-[#18A36C]/10"
              >
                <h3 className="text-lg font-semibold text-[#2E2E2E] mb-4 flex items-center gap-2">
                  <span className="w-1 h-6 bg-gradient-to-b from-[#18A36C] to-[#15905f] rounded-full" />
                  Мы предлагаем
                </h3>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <Gift className="w-5 h-5 text-[#18A36C] mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700">Достойная заработная плата</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Gift className="w-5 h-5 text-[#18A36C] mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700">Социальный пакет</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Gift className="w-5 h-5 text-[#18A36C] mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700">Возможности для профессионального развития</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Gift className="w-5 h-5 text-[#18A36C] mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700">Современное оборудование</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Gift className="w-5 h-5 text-[#18A36C] mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700">Дружная команда профессионалов</span>
                  </li>
                </ul>
              </motion.div>

              {/* Contact Information */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <h3 className="text-lg font-semibold text-[#2E2E2E] mb-4 flex items-center gap-2">
                  <span className="w-1 h-6 bg-gradient-to-b from-[#18A36C] to-[#15905f] rounded-full" />
                  Контактная информация
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <a
                    href={`tel:${phoneLink}`}
                    className="flex items-center gap-3 text-[#18A36C] hover:text-[#18A36C]/80 transition-all duration-200 group bg-gradient-to-br from-[#18A36C]/5 to-transparent p-4 rounded-xl border border-[#18A36C]/10 hover:border-[#18A36C]/30"
                  >
                    <div className="w-12 h-12 bg-gradient-to-br from-[#18A36C] to-[#15905f] rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform shadow-md">
                      <Phone className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <div className="text-sm text-gray-600">Телефон</div>
                      <div className="font-semibold">{phoneDisplay}</div>
                    </div>
                  </a>

                  <a
                    href={`mailto:${email}?subject=Отклик на вакансию: ${vacancy.name}`}
                    className="flex items-center gap-3 text-[#18A36C] hover:text-[#18A36C]/80 transition-all duration-200 group bg-gradient-to-br from-[#18A36C]/5 to-transparent p-4 rounded-xl border border-[#18A36C]/10 hover:border-[#18A36C]/30"
                  >
                    <div className="w-12 h-12 bg-gradient-to-br from-[#18A36C] to-[#15905f] rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform shadow-md">
                      <Mail className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <div className="text-sm text-gray-600">Email</div>
                      <div className="font-semibold text-sm">{email}</div>
                    </div>
                  </a>
                </div>
              </motion.div>

              {/* Action Buttons */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35 }}
                className="pt-4 border-t border-gray-100 grid grid-cols-1 md:grid-cols-2 gap-3"
              >
                <button
                  onClick={() => window.location.href = `tel:${phoneLink}`}
                  className="w-full bg-gradient-to-r from-[#18A36C] to-[#15905f] hover:from-[#15905f] hover:to-[#18A36C] text-white py-4 px-6 rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98]"
                >
                  <Phone className="w-5 h-5" />
                  Позвонить
                </button>
                <button
                  onClick={() => window.location.href = `mailto:${email}?subject=Отклик на вакансию: ${vacancy.name}`}
                  className="w-full bg-white hover:bg-gradient-to-r hover:from-[#18A36C] hover:to-[#15905f] border-2 border-[#18A36C] text-[#18A36C] hover:text-white py-4 px-6 rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98]"
                >
                  <Mail className="w-5 h-5" />
                  Написать письмо
                </button>
              </motion.div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
