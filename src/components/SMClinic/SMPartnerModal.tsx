"use client";

import { AnimatePresence, motion } from 'framer-motion';
import { ExternalLink, Globe, X, Building2 } from 'lucide-react';
import { ImageWithFallback } from '../SMImage/ImageWithFallback';

interface Partner {
  id: number;
  name: string;
  description: string;
  image_url: string;
  website_url: string;
  number: number;
  category: {
    name: string;
    slug: string;
  };
}

interface PartnerModalProps {
  partner: Partner | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function PartnerModal({ partner, open, onOpenChange }: PartnerModalProps) {
  if (!partner) return null;

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
            className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-white rounded-2xl shadow-2xl"
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
                  <Building2 className="w-7 h-7 text-white" />
                </div>
                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-[#2E2E2E] mb-2">
                    {partner.name}
                  </h2>
                  <span className="inline-block px-3 py-1 bg-gradient-to-r from-[#18A36C]/10 to-[#18A36C]/5 text-[#18A36C] text-sm font-medium rounded-full border border-[#18A36C]/20">
                    {partner.category.name}
                  </span>
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
                className="relative h-64 rounded-xl overflow-hidden shadow-md"
              >
                <ImageWithFallback
                  src={partner.image_url}
                  alt={partner.name}
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
                  О партнёре
                </h3>
                <p className="text-gray-700 leading-relaxed">
                  {partner.description}
                </p>
              </motion.div>

              {/* Contact Information */}
              {partner.website_url && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <h3 className="text-lg font-semibold text-[#2E2E2E] mb-3 flex items-center gap-2">
                    <span className="w-1 h-6 bg-gradient-to-b from-[#18A36C] to-[#15905f] rounded-full" />
                    Контактная информация
                  </h3>
                  <div className="space-y-3">
                    <a
                      href={partner.website_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 text-[#18A36C] hover:text-[#18A36C]/80 transition-all duration-200 group bg-gradient-to-br from-[#18A36C]/5 to-transparent p-4 rounded-xl border border-[#18A36C]/10 hover:border-[#18A36C]/30"
                    >
                      <div className="w-12 h-12 bg-gradient-to-br from-[#18A36C] to-[#15905f] rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform shadow-md">
                        <Globe className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <div className="text-sm text-gray-600">Веб-сайт</div>
                        <div className="font-semibold">{partner.website_url}</div>
                      </div>
                      <ExternalLink className="w-5 h-5 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </a>
                  </div>
                </motion.div>
              )}

              {/* Action Button */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25 }}
                className="pt-4 border-t border-gray-100"
              >
                <button
                  onClick={() => window.open(partner.website_url, '_blank')}
                  className="w-full bg-gradient-to-r from-[#18A36C] to-[#15905f] hover:from-[#15905f] hover:to-[#18A36C] text-white py-4 px-6 rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98]"
                >
                  Перейти на сайт партнёра
                  <ExternalLink className="w-5 h-5" />
                </button>
              </motion.div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
