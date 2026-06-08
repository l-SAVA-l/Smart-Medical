import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Users, Star, Calendar, Phone, Mail, MapPin } from 'lucide-react';
import { Card } from '../common/SMCard/SMCard';
import { useRouter as useSMRouter } from '@/components/SMRouter/SMRouter';
import { useRouter } from 'next/navigation';
import { ImageWithFallback } from '../SMImage/ImageWithFallback';
import { SpecialistCardSkeleton } from './SMDoctorSkeleton';
import { useContacts } from '@/hooks/useContacts';

interface Specialist {
  id: number;
  name: string;
  specialization: string;
  qualification: string;
  experience: number;
  grade: number;
  image_url: string;
  activity_area: string | null;
  education_details: string | null;
  conferences: string[];
  specializations: string[];
  education: string[];
  work_examples: Array<{ title: string; images: string[] }> | null;
  category?: {
    id: number;
    name: string;
    slug: string;
  } | null;
  serviceCategory?: {
    id: number;
    name: string;
    slug: string;
  } | null;
}

interface ServiceCategory {
  id: number;
  name: string;
  slug: string;
  icon: string | null;
}

export function DoctorsContent() {
  const { currentRoute, navigate } = useSMRouter();
  const router = useRouter();
  const { contacts } = useContacts();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [specialists, setSpecialists] = useState<Specialist[]>([]);
  const [categories, setCategories] = useState<ServiceCategory[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch('/api/service-categories');
        if (!response.ok) throw new Error('Failed to fetch service categories');
        const data = await response.json();
        setCategories(data);
      } catch (err) {
        setError('Не удалось загрузить категории');
      }
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    const routeParts = currentRoute.split('/').filter(Boolean);
    if (routeParts[0] === 'doctors' && routeParts[1]) {
      setSelectedCategory(routeParts[1]);
    } else {
      setSelectedCategory(null);
      setSpecialists([]);
    }
  }, [currentRoute]);

  useEffect(() => {
    const fetchSpecialists = async () => {
      if (!selectedCategory) {
        setSpecialists([]);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        // Используем slug категории услуг для фильтрации
        const response = await fetch(`/api/specialists?serviceCategorySlug=${selectedCategory}`);
        if (!response.ok) throw new Error('Failed to fetch specialists');
        const data = await response.json();
        setSpecialists(data);
      } catch (err) {
        setError('Не удалось загрузить специалистов');
        setSpecialists([]);
      } finally {
        setLoading(false);
      }
    };

    fetchSpecialists();
  }, [selectedCategory]);

  const selectedCategoryData = selectedCategory
    ? categories.find(cat => cat.slug === selectedCategory) || null
    : null;

  // Обновляем title страницы
  useEffect(() => {
    if (selectedCategoryData) {
      document.title = `${selectedCategoryData.name} - Специалисты | Медицинский центр Doctor Family`;
    } else if (selectedCategory) {
      document.title = `Специалисты | Медицинский центр Doctor Family`;
    } else {
      document.title = 'Специалисты | Медицинский центр Doctor Family';
    }
  }, [selectedCategoryData, selectedCategory]);

  const handleDoctorClick = (doctorId: number) => {
    navigate(`/doctors/${selectedCategory}/${doctorId}`);
  };

  if (!selectedCategory) {
    return (
      <div className="p-4 lg:p-8">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 lg:mb-12"
          >
            <div className="text-center mb-6 lg:mb-8">
              <div className="w-16 h-16 bg-[#18A36C] rounded-lg flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-2xl lg:text-3xl text-[#2E2E2E] mb-3 lg:mb-4">
                Наши специалисты
              </h1>
              <p className="text-sm lg:text-base text-gray-600 leading-relaxed">
                Команда высококвалифицированных врачей Doctor Family готова оказать вам профессиональную медицинскую помощь. 
                Выберите нужную специализацию в меню слева.
              </p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12"
          >
            <Card className="p-6 text-center rounded-lg border border-[#E8E6E3] hover:border-[#18A36C] transition-all duration-300">
              <div className="flex justify-center mb-3">
                <div className="w-12 h-12 bg-[#18A36C]/10 rounded-lg flex items-center justify-center">
                  <Users className="w-6 h-6 text-[#18A36C]" />
                </div>
              </div>
              <h3 className="text-2xl text-[#2E2E2E] mb-2">15+</h3>
              <p className="text-gray-600">Опытных врачей</p>
            </Card>

            <Card className="p-6 text-center rounded-lg border border-[#E8E6E3] hover:border-[#18A36C] transition-all duration-300">
              <div className="flex justify-center mb-3">
                <div className="w-12 h-12 bg-[#18A36C]/10 rounded-lg flex items-center justify-center">
                  <Star className="w-6 h-6 text-[#18A36C]" />
                </div>
              </div>
              <h3 className="text-2xl text-[#2E2E2E] mb-2">4.9</h3>
              <p className="text-gray-600">Средний рейтинг</p>
            </Card>

            <Card className="p-6 text-center rounded-lg border border-[#E8E6E3] hover:border-[#18A36C] transition-all duration-300">
              <div className="flex justify-center mb-3">
                <div className="w-12 h-12 bg-[#18A36C]/10 rounded-lg flex items-center justify-center">
                  <Calendar className="w-6 h-6 text-[#18A36C]" />
                </div>
              </div>
              <h3 className="text-2xl text-[#2E2E2E] mb-2">24/7</h3>
              <p className="text-gray-600">Круглосуточно</p>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-[#18A36C] rounded-lg p-6 text-white"
          >
            <h2 className="text-xl mb-4">Связаться с нами</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <a
                href={`tel:${(contacts?.phone_number || '+375 29 161-01-01').replace(/[\s\-()]/g, '')}`}
                className="flex items-center gap-2 cursor-pointer hover:scale-105 transition-transform duration-200 inline-block"
              >
                <Phone className="w-4 h-4" />
                <span>{contacts?.phone_number || '+375 29 161-01-01'}</span>
              </a>
              <a
                href={`mailto:${contacts?.email || 'smartmedical.by@gmail.com'}`}
                className="flex items-center gap-2 cursor-pointer hover:scale-105 transition-transform duration-200 inline-block"
              >
                <Mail className="w-4 h-4" />
                <span>{contacts?.email || 'smartmedical.by@gmail.com'}</span>
              </a>
              <a
                href={`https://yandex.ru/maps/?text=${encodeURIComponent(contacts?.address || 'г. Минск, пр. Победителей, д. 119, пом. 504')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 cursor-pointer hover:scale-105 transition-transform duration-200 inline-block"
              >
                <MapPin className="w-4 h-4" />
                <span>{contacts?.address || 'г. Минск, пр. Победителей, д. 119, пом. 504'}</span>
              </a>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 lg:p-8">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="mb-6">
            <h1 className="text-2xl lg:text-3xl text-[#2E2E2E] mb-2">
              {selectedCategoryData?.name ?? 'Специалисты'}
            </h1>
            <p className="text-gray-600">
              {specialists.length} {specialists.length === 1 ? 'специалист' : specialists.length < 5 ? 'специалиста' : 'специалистов'}
            </p>
          </div>
        </motion.div>

        {loading ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <SpecialistCardSkeleton key={i} />
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-red-100 rounded-lg flex items-center justify-center mx-auto mb-4">
              <Users className="w-8 h-8 text-red-600" />
            </div>
            <h3 className="text-lg text-red-600 mb-2">Ошибка</h3>
            <p className="text-sm text-gray-600">
              {error}
            </p>
          </div>
        ) : specialists.length > 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="grid grid-cols-1 lg:grid-cols-2 gap-6"
          >
            {specialists.map((specialist, index) => {
              return (
                <motion.div
                  key={specialist.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card
                    onClick={() => handleDoctorClick(specialist.id)}
                    className="p-6 hover:shadow-lg transition-all duration-300 group border border-[#E8E6E3] hover:border-[#18A36C] rounded-lg cursor-pointer"
                  >
                    <div className="flex flex-col sm:flex-row gap-4">
                      <div className="flex-shrink-0 mx-auto sm:mx-0">
                        <div className="w-24 h-24 rounded-lg overflow-hidden transition-all duration-300">
                          <ImageWithFallback
                            src={specialist.image_url}
                            alt={specialist.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      </div>

                      <div className="flex-1 text-center sm:text-left">
                        <div>
                          <h3 className="text-lg text-[#2E2E2E] mb-1 group-hover:text-[#18A36C] transition-colors">
                            {specialist.name}
                          </h3>
                          <p className="text-sm text-gray-600 mb-2">{specialist.specialization}</p>

                          <div className="text-sm text-gray-600 mb-3 flex flex-col gap-1 items-center sm:items-start">
                            <span>{specialist.qualification}</span>
                            <span>Стаж: {specialist.experience} {specialist.experience === 1 ? 'год' : specialist.experience < 5 ? 'года' : 'лет'}</span>
                          </div>

                          <div className="flex items-center gap-1 justify-center sm:justify-start">
                            {[...Array(specialist.grade)].map((_, i) => (
                              <Star
                                key={i}
                                className="w-4 h-4 fill-yellow-400 text-yellow-400"
                              />
                            ))}
                            {[...Array(5 - specialist.grade)].map((_, i) => (
                              <Star
                                key={i + specialist.grade}
                                className="w-4 h-4 fill-gray-200 text-gray-200"
                              />
                            ))}
                            <span className="text-sm text-gray-600 ml-1">
                              ({specialist.grade}/5)
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              );
            })}
          </motion.div>
        ) : (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-[#E8E6E3] rounded-lg flex items-center justify-center mx-auto mb-4">
              <Users className="w-8 h-8 text-gray-600" />
            </div>
            <h3 className="text-lg text-gray-600 mb-2">Врачи не найдены</h3>
            <p className="text-sm text-gray-600">
              В данной категории пока нет доступных специалистов
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
