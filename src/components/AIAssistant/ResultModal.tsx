"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, User, Briefcase, Star, GraduationCap, ShoppingBag, Tag, ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";

interface SpecialistData {
  id: number;
  name: string;
  qualification: string;
  experience: number;
  specialization: string;
  image_url?: string;
  education?: string[];
  categorySlug: string;
}

interface ServiceData {
  id: number;
  title: string;
  description: string;
  category: string;
  categorySlug: string;
  price: number;
}

interface CardData {
  type: "specialist" | "service";
  data: SpecialistData | ServiceData;
}

interface ResultModalProps {
  isOpen: boolean;
  cards: CardData[];
  onClose: () => void;
}

export function ResultModal({ isOpen, cards, onClose }: ResultModalProps) {
  const router = useRouter();

  if (!isOpen || !cards || cards.length === 0) return null;

  const handleNavigate = (card: CardData) => {
    let url: string;

    if (card.type === "specialist") {
      const specialist = card.data as SpecialistData;
      url = `/doctors/${specialist.categorySlug}/${specialist.id}`;
    } else {
      const service = card.data as ServiceData;
      url = `/services/${service.categorySlug}/${service.id}`;
    }

    onClose();
    router.push(url);
  };

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
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60]"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[70] w-[90%] max-w-md max-h-[80vh] overflow-y-auto bg-white rounded-2xl shadow-2xl"
          >
            {/* Header */}
            <div className="sticky top-0 bg-gradient-to-r from-[#18A36C] to-[#15905f] p-4 flex items-center justify-between rounded-t-2xl">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                  <Star className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-white font-semibold text-lg">
                    {cards.length === 1 ? "Найден результат!" : `Найдено результатов: ${cards.length}`}
                  </h3>
                  <p className="text-white/80 text-xs">Нажмите для перехода</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-lg bg-white/20 hover:bg-white/30 flex items-center justify-center text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="p-4 space-y-3">
              {cards.map((card, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  {card.type === "specialist" ? (
                    <SpecialistResultCard
                      data={card.data as SpecialistData}
                      onNavigate={() => handleNavigate(card)}
                    />
                  ) : (
                    <ServiceResultCard
                      data={card.data as ServiceData}
                      onNavigate={() => handleNavigate(card)}
                    />
                  )}
                </motion.div>
              ))}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

function SpecialistResultCard({ data, onNavigate }: { data: SpecialistData; onNavigate: () => void }) {
  return (
    <div className="bg-gradient-to-br from-white to-gray-50 rounded-xl p-4 border-2 border-gray-200 shadow-sm">
      <div className="flex gap-3 mb-3">
        {/* Avatar */}
        <div className="flex-shrink-0">
          {data.image_url ? (
            <img
              src={data.image_url}
              alt={data.name}
              className="w-16 h-16 rounded-full object-cover border-2 border-gray-200"
            />
          ) : (
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#18A36C] to-[#15905f] flex items-center justify-center">
              <User className="w-8 h-8 text-white" />
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex-1">
          <h4 className="font-bold text-gray-900 text-base">{data.name}</h4>
          <p className="text-sm text-gray-600 flex items-center gap-1 mt-1">
            <Briefcase className="w-4 h-4" />
            {data.qualification}
          </p>
          <p className="text-sm text-[#18A36C] flex items-center gap-1 mt-1">
            <Star className="w-4 h-4" />
            {data.specialization}
          </p>
        </div>
      </div>

      {data.experience && (
        <p className="text-sm text-gray-600 mb-2">
          <strong>Опыт работы:</strong> {data.experience} лет
        </p>
      )}

      {data.education && data.education.length > 0 && (
        <p className="text-xs text-gray-500 flex items-center gap-1 mb-3">
          <GraduationCap className="w-4 h-4 flex-shrink-0" />
          <span>{data.education[0]}</span>
        </p>
      )}

      {/* Navigate Button */}
      <button
        onClick={onNavigate}
        className="w-full bg-gradient-to-r from-[#18A36C] to-[#15905f] text-white py-3 rounded-xl font-semibold flex items-center justify-center gap-2 hover:shadow-lg transition-all"
      >
        Перейти к специалисту
        <ArrowRight className="w-5 h-5" />
      </button>
    </div>
  );
}

function ServiceResultCard({ data, onNavigate }: { data: ServiceData; onNavigate: () => void }) {
  return (
    <div className="bg-gradient-to-br from-white to-green-50 rounded-xl p-4 border-2 border-gray-200 shadow-sm">
      <div className="flex gap-3 mb-3">
        {/* Icon */}
        <div className="flex-shrink-0">
          <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-[#18A36C] to-[#15905f] flex items-center justify-center">
            <ShoppingBag className="w-7 h-7 text-white" />
          </div>
        </div>

        {/* Info */}
        <div className="flex-1">
          <h4 className="font-bold text-gray-900 text-base">{data.title}</h4>
          <p className="text-sm text-gray-600 flex items-center gap-1 mt-1">
            <Tag className="w-4 h-4" />
            {data.category}
          </p>
        </div>
      </div>

      {data.description && (
        <p className="text-sm text-gray-600 mb-3">{data.description}</p>
      )}

      {data.price && (
        <div className="bg-green-50 rounded-lg p-3 mb-3 border border-green-200">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-700 font-medium">Стоимость:</span>
            <span className="text-lg font-bold text-[#18A36C]">{data.price} BYN</span>
          </div>
        </div>
      )}

      {/* Navigate Button */}
      <button
        onClick={onNavigate}
        className="w-full bg-gradient-to-r from-[#18A36C] to-[#15905f] text-white py-3 rounded-xl font-semibold flex items-center justify-center gap-2 hover:shadow-lg transition-all"
      >
        Перейти к услуге
        <ArrowRight className="w-5 h-5" />
      </button>
    </div>
  );
}
