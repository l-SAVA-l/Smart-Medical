'use client';

import { useState } from 'react';
import { ImageUploader } from './ImageUploader';
import { ChevronDown } from 'lucide-react';

interface ImageSlot {
  key: string;
  label: string;
  value: string;
}

interface MultiImageUploaderProps {
  images: {
    image_url: string;
    image_url_1: string;
    image_url_2: string;
    image_url_3: string;
    image_url_4: string;
  };
  onChange: (key: string, url: string) => void;
  folder: string;
  maxSizeMB?: number;
}

export function MultiImageUploader({
  images,
  onChange,
  folder,
  maxSizeMB = 10,
}: MultiImageUploaderProps) {
  const slots: ImageSlot[] = [
    { key: 'image_url', label: 'Главное изображение', value: images.image_url },
    { key: 'image_url_1', label: 'Изображение 1', value: images.image_url_1 },
    { key: 'image_url_2', label: 'Изображение 2', value: images.image_url_2 },
    { key: 'image_url_3', label: 'Изображение 3', value: images.image_url_3 },
    { key: 'image_url_4', label: 'Изображение 4 (опционально)', value: images.image_url_4 },
  ];

  const [selectedSlot, setSelectedSlot] = useState(slots[0].key);
  const currentSlot = slots.find(s => s.key === selectedSlot) || slots[0];

  return (
    <div className="space-y-4">
      {/* Dropdown для выбора слота */}
      <div className="relative">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Выберите слот изображения
        </label>
        <div className="relative">
          <select
            value={selectedSlot}
            onChange={(e) => setSelectedSlot(e.target.value)}
            className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#18A36C] focus:border-transparent appearance-none cursor-pointer transition-all"
          >
            {slots.map((slot) => (
              <option key={slot.key} value={slot.key}>
                {slot.label}
                {slot.value ? ' ✓' : ''}
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
        </div>
      </div>

      {/* Превью всех изображений */}
      <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
        <p className="text-xs font-medium text-gray-600 mb-3">Загруженные изображения:</p>
        <div className="grid grid-cols-5 gap-2">
          {slots.map((slot) => (
            <button
              key={slot.key}
              type="button"
              onClick={() => setSelectedSlot(slot.key)}
              className={`relative aspect-square rounded-lg overflow-hidden border-2 transition-all ${
                selectedSlot === slot.key
                  ? 'border-[#18A36C] ring-2 ring-[#18A36C]/20'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
              title={slot.label}
            >
              {slot.value ? (
                <img
                  src={slot.value}
                  alt={slot.label}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                  <span className="text-xs text-gray-400 font-medium">
                    {slot.key === 'image_url' ? 'Главное' : slot.key.replace('image_url_', '')}
                  </span>
                </div>
              )}
              {selectedSlot === slot.key && (
                <div className="absolute inset-0 bg-[#18A36C]/10 flex items-center justify-center">
                  <div className="w-6 h-6 bg-[#18A36C] rounded-full flex items-center justify-center">
                    <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                </div>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Загрузчик для выбранного слота */}
      <div className="bg-white rounded-xl p-4 border-2 border-dashed border-gray-300">
        <p className="text-sm font-medium text-gray-700 mb-3">
          Загрузка для: <span className="text-[#18A36C]">{currentSlot.label}</span>
        </p>
        <ImageUploader
          value={currentSlot.value}
          onChange={(url) => onChange(selectedSlot, url)}
          folder={folder}
          placeholder={`Загрузите ${currentSlot.label.toLowerCase()}`}
          maxSizeMB={maxSizeMB}
        />
      </div>
    </div>
  );
}
