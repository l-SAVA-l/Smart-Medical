'use client'

import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/common/SMTabs/SMTabs';
import { Button } from '../../components/common/SMButton/SMButton';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '../../components/common/SMAccordion/SMAccordion';
import { Card } from '../../components/common/SMCard/SMCard';
import { Badge } from '../../components/common/SMBadge/SMBadge';
import { ImageWithFallback } from '../../components/SMImage/ImageWithFallback';
import { NavigableServicesMenu } from '../../components/SMServices/SMNavigableServicesMenu';
import { ServicesContent } from '../../components/SMServices/SMServicesContent';
import { usePathname, useRouter } from 'next/navigation';
import { SpecialistCard } from '../../components/SMDoctor/SMSpecialistCard';

import { Star, Play, FileText, HelpCircle, MessageSquare, Users, ArrowRight, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { getServiceData, ServiceData } from '@/data/SMServicesData/SMServicesData';
import { useEffect, useState, useCallback } from 'react';
import { mapServiceFromDBToServiceData, ServiceFromDB } from '@/utils/serviceMapper';
import { ServicePageSkeleton } from '../../components/SMServices/SMServicesSkeleton';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { AskQuestionModal } from '@/components/AskQuestionModal/AskQuestionModal';
import { useAskQuestionModal } from '@/hooks/useAskQuestionModal';

// Функция для конвертации YouTube URL в embed формат
function getYouTubeEmbedUrl(url: string): string | null {
  if (!url) return null;

  // Если уже embed URL
  if (url.includes('/embed/')) return url;

  // Извлекаем video ID из разных форматов YouTube URL
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\s?]+)/,
    /youtube\.com\/watch\?.*v=([^&\s]+)/,
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match && match[1]) {
      return `https://www.youtube.com/embed/${match[1]}`;
    }
  }

  return null;
}

// Компонент модального окна для просмотра фотографий
interface PhotoModalProps {
  images: string[];
  currentIndex: number;
  isOpen: boolean;
  onClose: () => void;
  onNext: () => void;
  onPrev: () => void;
  title: string;
}

function PhotoModal({ images, currentIndex, isOpen, onClose, onNext, onPrev, title }: PhotoModalProps) {
  // Закрытие по Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight') onNext();
      if (e.key === 'ArrowLeft') onPrev();
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose, onNext, onPrev]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center">
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/90 backdrop-blur-sm"
          />

          {/* Content */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="relative z-10 w-full max-w-2xl mx-4"
          >
            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute -top-10 right-0 p-2 text-white/80 hover:text-white transition-colors"
            >
              <X className="w-6 h-6" />
            </button>

            {/* Image counter */}
            <div className="absolute -top-10 left-0 text-white/80 text-sm">
              {currentIndex + 1} / {images.length}
            </div>

            {/* Image */}
            <div className="relative bg-black rounded-lg overflow-hidden">
              <img
                src={images[currentIndex]}
                alt={`${title} - фото ${currentIndex + 1}`}
                className="w-full h-auto max-h-[70vh] object-contain mx-auto"
              />
            </div>

            {/* Navigation */}
            {images.length > 1 && (
              <>
                <button
                  onClick={onPrev}
                  className="absolute left-2 top-1/2 -translate-y-1/2 p-2 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={onNext}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </>
            )}

            {/* Thumbnails */}
            {images.length > 1 && (
              <div className="flex justify-center gap-1.5 mt-3">
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      // Navigate to this image
                      const diff = idx - currentIndex;
                      if (diff > 0) {
                        for (let i = 0; i < diff; i++) onNext();
                      } else {
                        for (let i = 0; i < -diff; i++) onPrev();
                      }
                    }}
                    className={`w-12 h-12 rounded overflow-hidden border-2 transition-all ${idx === currentIndex ? 'border-[#18A36C] scale-105' : 'border-transparent opacity-50 hover:opacity-100'
                      }`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

interface ServicePageProps {
  serviceId: string;
  categoryId: string;
}

export function ServicePage({ serviceId, categoryId }: ServicePageProps) {
  const router = useRouter();
  const [serviceData, setServiceData] = useState<ServiceData | null>(null);
  const [loading, setLoading] = useState(true);
  const [showAllSpecialists, setShowAllSpecialists] = useState(false);
  const askQuestionModal = useAskQuestionModal();

  // Photo modal state
  const [photoModalOpen, setPhotoModalOpen] = useState(false);
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);

  // Reset showAllSpecialists when service changes
  useEffect(() => {
    setShowAllSpecialists(false);
  }, [serviceId, categoryId]);

  const openPhotoModal = useCallback((index: number) => {
    setCurrentPhotoIndex(index);
    setPhotoModalOpen(true);
  }, []);

  const closePhotoModal = useCallback(() => {
    setPhotoModalOpen(false);
  }, []);

  const nextPhoto = useCallback(() => {
    if (serviceData?.gallery) {
      setCurrentPhotoIndex((prev) => (prev + 1) % serviceData.gallery.length);
    }
  }, [serviceData?.gallery]);

  const prevPhoto = useCallback(() => {
    if (serviceData?.gallery) {
      setCurrentPhotoIndex((prev) => (prev - 1 + serviceData.gallery.length) % serviceData.gallery.length);
    }
  }, [serviceData?.gallery]);

  useEffect(() => {
    async function fetchServiceData() {
      setLoading(true);
      setServiceData(null); // Clear previous data to show skeleton

      try {
        // Пытаемся получить услугу из API
        const response = await fetch(`/api/services/by-category/${categoryId}/${serviceId}`);

        if (response.ok) {
          const serviceFromDB: ServiceFromDB = await response.json();
          const mappedData = mapServiceFromDBToServiceData(serviceFromDB);
          setServiceData(mappedData);
        } else {
          // Если услуга не найдена в БД, используем статический fallback
          const fallbackData = getServiceData(serviceId, categoryId);
          setServiceData(fallbackData);
        }
      } catch (error) {
        console.error('Failed to load service data:', error);
        const fallbackData = getServiceData(serviceId, categoryId);
        setServiceData(fallbackData);
      }

      setLoading(false);
    }

    if (serviceId && categoryId) {
      fetchServiceData();
    } else {
      // Если нет serviceId или categoryId, используем fallback
      const fallbackData = getServiceData(serviceId || '', categoryId || '');
      setServiceData(fallbackData);
      setLoading(false);
    }
  }, [serviceId, categoryId]);

  // Показываем скелетон при загрузке или если данных нет
  if (loading || !serviceData) {
    return <ServicePageSkeleton />;
  }

  // Формируем breadcrumbs
  const breadcrumbItems = [
    { label: 'Услуги', href: '/services' },
    { label: serviceData.category, href: `/services/${categoryId}` },
    { label: serviceData.title }
  ];

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-6xl mx-auto px-4 py-6 lg:py-8">
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow-sm p-6 lg:p-8 border border-gray-100">
            <div className="mb-4">
              <div className="flex items-center justify-between mb-3">
                <Badge variant="secondary" className="bg-[#18A36C]/10 text-[#18A36C]">
                  {serviceData.category}
                </Badge>
                {serviceData.price && (
                  <Badge className="bg-[#18A36C] text-white text-lg px-4 py-1">
                    {serviceData.price}
                  </Badge>
                )}
              </div>
              <h1 className="text-2xl lg:text-3xl text-[#2E2E2E] mb-4">{serviceData.title}</h1>
              <p className="text-gray-600 leading-relaxed">
                {serviceData.description}
              </p>
            </div>

            {/* Images Section */}
            <div className="mb-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Main Image - always visible */}
                <div className="border border-[#E8E6E3] rounded-lg overflow-hidden">
                  <ImageWithFallback
                    src={serviceData.image}
                    alt={serviceData.title}
                    className="w-full h-64 md:h-80 object-cover"
                  />
                </div>

                {/* Secondary Image - tablet and desktop, from gallery if available */}
                {serviceData.gallery && serviceData.gallery.length > 0 && (
                  <div className="hidden md:block border border-[#E8E6E3] rounded-lg overflow-hidden">
                    <ImageWithFallback
                      src={serviceData.gallery[0]}
                      alt={`${serviceData.title} - дополнительное изображение`}
                      className="w-full h-80 object-cover"
                    />
                  </div>
                )}
              </div>
            </div>
          </div>

          <Card className="overflow-hidden border border-gray-100">
            <Tabs defaultValue="description" className="w-full">
              <div className="border-b border-gray-200">
                <TabsList className="grid w-full grid-cols-3 bg-white p-2 rounded-none h-auto gap-2">
                  <TabsTrigger
                    value="description"
                    className="data-[state=active]:bg-[#18A36C] focus:cursor-default data-[state=active]:text-white data-[state=active]:border-[#18A36C] data-[state=inactive]:text-[#2E2E2E] data-[state=inactive]:hover:text-[#18A36C] data-[state=inactive]:hover:bg-[#18A36C]/5 data-[state=inactive]:hover:border-[#18A36C] data-[state=inactive]:border-2 data-[state=inactive]:border-gray-300 transition-all cursor-pointer duration-300 rounded-lg py-3 px-4"
                  >
                    <span className="flex items-center justify-center gap-2">
                      Описание
                      <FileText className="w-5 h-5" />
                    </span>
                  </TabsTrigger>

                  <TabsTrigger
                    value="faq"
                    className="data-[state=active]:bg-[#18A36C] cursor-pointer focus:cursor-default data-[state=active]:text-white data-[state=active]:border-[#18A36C] data-[state=inactive]:text-[#2E2E2E] data-[state=inactive]:hover:text-[#18A36C] data-[state=inactive]:hover:bg-[#18A36C]/5 data-[state=inactive]:hover:border-[#18A36C] data-[state=inactive]:border-2 data-[state=inactive]:border-gray-300 transition-all duration-300 rounded-lg py-3 px-4"
                  >
                    <span className="flex items-center justify-center gap-2">
                      <span className="hidden sm:inline">Вопросы и ответы</span>
                      <span className="sm:hidden">Вопросы</span>
                      <HelpCircle className="w-5 h-5" />
                    </span>
                  </TabsTrigger>

                  <TabsTrigger
                    value="reviews"
                    className="data-[state=active]:bg-[#18A36C] cursor-pointer focus:cursor-default data-[state=active]:text-white data-[state=active]:border-[#18A36C] data-[state=inactive]:text-[#2E2E2E] data-[state=inactive]:hover:text-[#18A36C] data-[state=inactive]:hover:bg-[#18A36C]/5 data-[state=inactive]:hover:border-[#18A36C] data-[state=inactive]:border-2 data-[state=inactive]:border-gray-300 transition-all duration-300 rounded-lg py-3 px-4"
                  >
                    <span className="flex items-center justify-center gap-2">
                      Отзывы
                      <MessageSquare className="w-5 h-5" />
                    </span>
                  </TabsTrigger>
                </TabsList>
              </div>

              <TabsContent value="description" className="p-6 lg:p-8">
                <div className="space-y-6">
                  <div className="prose max-w-none">
                    <p className="text-[#2E2E2E] leading-relaxed whitespace-pre-line">
                      {serviceData.fullDescription}
                    </p>
                  </div>

                  {/* Секция видео - показываем только если есть валидное видео */}
                  {(() => {
                    const embedUrl = serviceData.videoUrl ? getYouTubeEmbedUrl(serviceData.videoUrl) : null;
                    if (!embedUrl) return null;

                    return (
                      <div>
                        <h3 className="text-lg text-[#2E2E2E] mb-4">Видео о процедуре</h3>
                        <div className="relative">
                          <div className="aspect-video bg-black rounded-lg overflow-hidden">
                            <iframe
                              src={embedUrl}
                              className="w-full h-full"
                              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                              allowFullScreen
                              title="Видео о процедуре"
                            />
                          </div>
                        </div>
                      </div>
                    );
                  })()}

                  {/* Секция фотографий - показываем только если есть фото (кроме заглавной) */}
                  {serviceData.gallery && serviceData.gallery.length > 0 && (
                    <div>
                      <h3 className="text-lg text-[#2E2E2E] mb-4">Фотографии</h3>
                      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                        {serviceData.gallery.map((imageUrl, index) => (
                          <div
                            key={index}
                            className="aspect-square cursor-pointer group"
                            onClick={() => openPhotoModal(index)}
                          >
                            <div className="relative w-full h-full overflow-hidden rounded-lg">
                              <ImageWithFallback
                                src={imageUrl}
                                alt={`${serviceData.title} фото ${index + 1}`}
                                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                              />
                              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                                <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                                  <div className="w-12 h-12 bg-white/90 rounded-full flex items-center justify-center">
                                    <Play className="w-5 h-5 text-[#18A36C] ml-0.5" />
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="faq" className="p-6 lg:p-8">
                <Accordion type="single" collapsible className="w-full">
                  {serviceData.faq.map((item, index) => (
                    <AccordionItem key={index} value={`item-${index}`}>
                      <AccordionTrigger className="text-left text-[#2E2E2E] hover:text-[#18A36C]">
                        {item.question}
                      </AccordionTrigger>
                      <AccordionContent className="text-[#2E2E2E] leading-relaxed">
                        {item.answer}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </TabsContent>

              <TabsContent value="reviews" className="p-6 lg:p-8">
                <div className="space-y-6">
                  {serviceData.reviews.map((review) => {
                    // Генерация инициалов из имени
                    const getInitials = (name: string) => {
                      const parts = name.trim().split(/\s+/);
                      if (parts.length >= 2) {
                        return (parts[0][0] + parts[1][0]).toUpperCase();
                      }
                      return name.charAt(0).toUpperCase();
                    };

                    return (
                      <div key={review.id} className="border-b border-gray-200 last:border-b-0 pb-6 last:pb-0">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-[#18A36C]/10 rounded-full flex items-center justify-center overflow-hidden">
                              {review.image_url ? (
                                <img
                                  src={review.image_url}
                                  alt={review.name}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <span className="text-[#18A36C] font-medium">
                                  {getInitials(review.name)}
                                </span>
                              )}
                            </div>
                            <div>
                              <h4 className="font-medium text-gray-700">{review.name}</h4>
                              <p className="text-sm text-gray-500">{review.date}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-1">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`w-4 h-4 ${i < review.rating
                                  ? 'fill-[#18A36C] text-[#18A36C]'
                                  : 'text-gray-300'
                                  }`}
                              />
                            ))}
                          </div>
                        </div>
                        <p className="text-gray-700 leading-relaxed">{review.text}</p>
                      </div>
                    );
                  })}

                  <div className="text-center pt-6">
                    <Button variant="outline" className="border-[#18A36C] text-[#18A36C] hover:shadow-lg hover:shadow-[#18A36C]/20">
                      Показать все отзывы
                    </Button>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </Card>

          {serviceData.specialists.length > 0 && (
            <Card className="p-6 lg:p-8 border border-gray-100">
              <div className="text-center mb-8">
                <h3 className="text-2xl text-[#2E2E2E] mb-2">Наши специалисты</h3>
                <p className="text-gray-600">Профессиональная команда врачей высшей категории</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {(showAllSpecialists ? serviceData.specialists : serviceData.specialists.slice(0, 2)).map((specialist, index) => (
                  <SpecialistCard
                    key={specialist.id}
                    specialist={specialist}
                    index={index}
                    onDoctorClick={(doctorId) => {
                      // Navigate to doctor page if needed
                    }}
                    onBookAppointment={(doctorId, doctorName) => {
                      // Handle booking appointment
                    }}
                  />
                ))}
              </div>

              <div className="flex flex-col items-center gap-4 mt-8">
                {serviceData.specialists.length > 2 && !showAllSpecialists && (
                  <Button
                    onClick={() => setShowAllSpecialists(true)}
                    variant="outline"
                    className="border-[#18A36C] text-[#18A36C] px-8 py-4 h-auto hover:shadow-xl hover:shadow-[#18A36C]/20"
                  >
                    Все специалисты по этой услуге
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                )}

                <Button
                  onClick={() => router.push('/doctors')}
                  className="bg-[#18A36C] hover:bg-[#15905f] text-white px-8 py-4 h-auto rounded-xl transition-all duration-300 cursor-pointer"
                >
                  <Users className="w-5 h-5 mr-2" />
                  <span className="text-lg">Показать всех специалистов</span>
                </Button>
              </div>
            </Card>
          )}

          <div className="p-6 bg-gradient-to-r from-[#F4F4F4] to-white rounded-2xl border border-gray-100">
            <div className="text-center">
              <HelpCircle className="w-12 h-12 text-[#18A36C] mx-auto mb-3" />
              <h3 className="text-lg text-gray-700 mb-2">Не нашли ответа на свой вопрос?</h3>
              <p className="text-sm text-gray-600 mb-4">
                Свяжитесь с нами, и мы предоставим необходимую информацию.
              </p>
              <Button
                onClick={askQuestionModal.open}
                className="bg-[#18A36C] hover:bg-[#18A36C]/90 text-white px-8 py-4 h-auto"
              >
                Задать вопрос
                <MessageSquare className="w-4 h-4 ml-[2.5px]" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Photo Modal */}
      {serviceData.gallery && serviceData.gallery.length > 0 && (
        <PhotoModal
          images={serviceData.gallery}
          currentIndex={currentPhotoIndex}
          isOpen={photoModalOpen}
          onClose={closePhotoModal}
          onNext={nextPhoto}
          onPrev={prevPhoto}
          title={serviceData.title}
        />
      )}

      {/* Ask Question Modal */}
      <AskQuestionModal
        isOpen={askQuestionModal.isOpen}
        onClose={askQuestionModal.close}
        onComplete={() => {
          // Здесь можно добавить логику для открытия чата или другого действия
        }}
      />
    </div>
  );
}

export default function SMServicesPage() {
  const pathname = usePathname();

  const pathParts = pathname.replace(/^\/+|\/+$/g, '').split('/');

  let categoryId = '';
  let serviceId = '';
  if (pathParts[0] === 'services') {
    categoryId = pathParts[1] || '';
    serviceId = pathParts[2] || '';
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <NavigableServicesMenu />
      <div className="flex-1">
        {categoryId && serviceId ? (
          <ServicePage categoryId={categoryId} serviceId={serviceId} />
        ) : (
          <ServicesContent />
        )}
      </div>
    </div>
  );
}
