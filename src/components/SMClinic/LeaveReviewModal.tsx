'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Star, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { Button } from '../common/SMButton/SMButton';
import { ImageUploader } from '../ImageUploader';
import { validateEmail } from '@/utils/validation';

interface LeaveReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function LeaveReviewModal({ isOpen, onClose }: LeaveReviewModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    text: '',
    grade: 0,
    image_url: '',
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [hoveredStar, setHoveredStar] = useState(0);

  // Validate name
  const validateName = (name: string) => {
    if (!name || name.trim().length < 2) {
      setFieldErrors(prev => ({ ...prev, name: 'Имя должно содержать минимум 2 символа' }));
      return false;
    }
    if (/\d/.test(name)) {
      setFieldErrors(prev => ({ ...prev, name: 'Имя не должно содержать цифры' }));
      return false;
    }
    setFieldErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors.name;
      return newErrors;
    });
    return true;
  };

  // Validate email field
  const validateEmailField = (email: string) => {
    const result = validateEmail(email);
    if (!result.isValid) {
      setFieldErrors(prev => ({ ...prev, email: result.error || 'Некорректный email' }));
      return false;
    }
    setFieldErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors.email;
      return newErrors;
    });
    return true;
  };

  // Validate review text
  const validateText = (text: string) => {
    if (!text || text.trim().length < 10) {
      setFieldErrors(prev => ({ ...prev, text: 'Отзыв должен содержать минимум 10 символов' }));
      return false;
    }
    if (text.length > 2000) {
      setFieldErrors(prev => ({ ...prev, text: 'Отзыв не должен превышать 2000 символов' }));
      return false;
    }
    setFieldErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors.text;
      return newErrors;
    });
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/reviews/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        setSuccess(true);
        setTimeout(() => {
          onClose();
          setSuccess(false);
          setFormData({ name: '', email: '', text: '', grade: 0, image_url: '' });
        }, 2000);
      } else {
        const data = await res.json();
        setError(data.error || 'Произошла ошибка при отправке отзыва');
      }
    } catch (err) {
      setError('Произошла ошибка при отправке отзыва');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      onClose();
      setError(null);
      setSuccess(false);
      setFieldErrors({});
      setHoveredStar(0);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 overflow-y-auto">
          {/* Backdrop */}
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
            transition={{ duration: 0.2 }}
            className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
          >
            {/* Header */}
            <div className="bg-[#18A36C] px-6 py-4 flex-shrink-0">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-white">Оставить отзыв</h2>
                <button
                  onClick={handleClose}
                  disabled={loading}
                  className="p-1.5 hover:bg-white/20 rounded-lg cursor-pointer transition-colors disabled:opacity-50"
                >
                  <X className="w-5 h-5 text-white" />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 overflow-y-auto flex-1">
              {success ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center py-8"
                >
                  <div className="w-16 h-16 bg-[#18A36C]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle className="w-8 h-8 text-[#18A36C]" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">Спасибо за ваш отзыв!</h3>
                  <p className="text-gray-600">
                    Ваш отзыв отправлен на модерацию и появится на сайте после проверки.
                  </p>
                </motion.div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  {error && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600">
                      {error}
                    </div>
                  )}

                  {/* Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Ваше имя <span className="text-red-500">*</span>
                      <span className="text-gray-400 text-xs font-normal ml-1">(мин. 2 символа, без цифр)</span>
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      onBlur={() => validateName(formData.name)}
                      placeholder="Иван Иванов"
                      required
                      className={`w-full px-4 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#18A36C]/20 focus:border-[#18A36C] transition-all ${fieldErrors.name ? 'border-red-500' : 'border-gray-200'}`}
                    />
                    {fieldErrors.name && (
                      <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        {fieldErrors.name}
                      </p>
                    )}
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Email <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      onBlur={() => validateEmailField(formData.email)}
                      placeholder="example@mail.com"
                      required
                      className={`w-full px-4 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#18A36C]/20 focus:border-[#18A36C] transition-all ${fieldErrors.email ? 'border-red-500' : 'border-gray-200'}`}
                    />
                    {fieldErrors.email ? (
                      <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        {fieldErrors.email}
                      </p>
                    ) : (
                      <p className="text-xs text-gray-500 mt-1">Не будет опубликован на сайте</p>
                    )}
                  </div>

                  {/* Rating */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Ваша оценка <span className="text-red-500">*</span>
                    </label>
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((star) => {
                        const isFilled = star <= (hoveredStar || formData.grade);
                        return (
                          <button
                            key={star}
                            type="button"
                            onClick={() => setFormData({ ...formData, grade: star })}
                            onMouseEnter={() => setHoveredStar(star)}
                            onMouseLeave={() => setHoveredStar(0)}
                            className="p-1 cursor-pointer transition-transform hover:scale-110"
                          >
                            <Star
                              className={`w-8 h-8 transition-colors ${isFilled
                                ? 'fill-yellow-400 text-yellow-400'
                                : 'text-gray-300'
                                }`}
                            />
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Review text */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Текст отзыва <span className="text-red-500">*</span>
                      <span className="text-gray-400 text-xs font-normal ml-1">(мин. 10 символов)</span>
                    </label>
                    <textarea
                      value={formData.text}
                      onChange={(e) => setFormData({ ...formData, text: e.target.value })}
                      onBlur={() => validateText(formData.text)}
                      placeholder="Расскажите о вашем опыте посещения клиники..."
                      required
                      rows={4}
                      className={`w-full px-4 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#18A36C]/20 focus:border-[#18A36C] transition-all resize-none ${fieldErrors.text ? 'border-red-500' : 'border-gray-200'}`}
                    />
                    <div className="flex justify-between items-center mt-1">
                      {fieldErrors.text ? (
                        <p className="text-red-500 text-xs flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" />
                          {fieldErrors.text}
                        </p>
                      ) : (
                        <span />
                      )}
                      <p className="text-xs text-gray-400">{formData.text.length}/2000</p>
                    </div>
                  </div>

                  <div className="h-[1px] bg-gray-200 w-full"></div>

                  {/* Photo */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5 text-center">
                      Ваше фото <span className="text-gray-400 font-normal">(необязательно)</span>
                    </label>
                    <div className="flex justify-center">
                      <ImageUploader
                        value={formData.image_url}
                        onChange={(url) => setFormData({ ...formData, image_url: url })}
                        folder="smartmedical/feedbacks"
                        placeholder="Загрузите фото"
                        maxSizeMB={5}
                      />
                    </div>
                  </div>

                  {/* Submit button */}
                  <Button
                    type="submit"
                    disabled={
                      loading ||
                      !formData.name ||
                      !formData.email ||
                      !formData.text ||
                      formData.grade === 0 ||
                      formData.name.trim().length < 2 ||
                      formData.text.trim().length < 10 ||
                      Object.keys(fieldErrors).length > 0
                    }
                    className="w-full bg-[#18A36C] hover:bg-[#15905f] text-white cursor-pointer py-3 rounded-xl font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Отправка...
                      </>
                    ) : (
                      'Отправить отзыв'
                    )}
                  </Button>
                </form>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
