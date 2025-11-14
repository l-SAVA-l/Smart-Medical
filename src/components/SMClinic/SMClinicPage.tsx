import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Star, FileText, MessageSquare, HelpCircle, ExternalLink, Phone, Globe, MapPin, Mail, Calendar, Building2, Users, DollarSign, Clock, Briefcase, ArrowLeft } from 'lucide-react';
import { Button } from '../common/SMButton/SMButton';
import { Card } from '../common/SMCard/SMCard';
import { Badge } from '../common/SMBadge/SMBadge';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/common/SMAccordion/SMAccordion';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/common/SMPagination/SMPagination';
import { getClinicItemById, getPartnersByCategory, getPartnerById, clinicReviews, ClinicItem, Partner, Review, Vacancy } from '../../data/SMClinicData/SMClinicData';
import { useRouter } from '@/components/SMRouter/SMRouter';
import { Breadcrumb } from '../SMBreadcrumb/SMBreadcrumb';
import { ImageWithFallback } from '../SMImage/ImageWithFallback';

interface ClinicPageProps {
  itemId: string;
  categoryId: string;
}

const REVIEWS_PER_PAGE = 10;

export function ClinicPage({ itemId, categoryId }: ClinicPageProps) {
  const [activeTab, setActiveTab] = useState('info');
  const [currentPage, setCurrentPage] = useState(1);
  const [vacancies, setVacancies] = useState<Vacancy[]>([]);
  const [vacancy, setVacancy] = useState<Vacancy | null>(null);
  const [loadingVacancies, setLoadingVacancies] = useState(false);
  const [loadingVacancy, setLoadingVacancy] = useState(false);
  const [errorVacancies, setErrorVacancies] = useState<string | null>(null);
  const [errorVacancy, setErrorVacancy] = useState<string | null>(null);
  const { navigate, currentRoute } = useRouter();

  const clinicItem = getClinicItemById(itemId);
  const categoryItem = categoryId !== itemId ? getClinicItemById(categoryId) : null;

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [itemId, categoryId]);

  // Загрузка списка вакансий
  useEffect(() => {
    if (itemId === 'vacancies') {
      setVacancy(null); // Сбрасываем состояние отдельной вакансии
      const fetchVacancies = async () => {
        setLoadingVacancies(true);
        setErrorVacancies(null);
        try {
          const response = await fetch('/api/vacancies');
          if (!response.ok) throw new Error('Failed to fetch vacancies');
          const data = await response.json();
          setVacancies(data);
        } catch (err) {
          console.error('Error fetching vacancies:', err);
          setErrorVacancies('Не удалось загрузить вакансии');
          setVacancies([]);
        } finally {
          setLoadingVacancies(false);
        }
      };
      fetchVacancies();
    }
  }, [itemId]);

  // Загрузка отдельной вакансии
  useEffect(() => {
    if (currentRoute.includes('/clinic/vacancies/') && itemId !== 'vacancies') {
      setVacancies([]); // Сбрасываем состояние списка вакансий
      const fetchVacancy = async () => {
        setLoadingVacancy(true);
        setErrorVacancy(null);
        try {
          const id = parseInt(itemId);
          if (isNaN(id)) {
            setErrorVacancy('Неверный ID вакансии');
            setLoadingVacancy(false);
            return;
          }
          const response = await fetch(`/api/vacancies/${id}`);
          if (!response.ok) {
            if (response.status === 404) {
              setErrorVacancy('Вакансия не найдена');
            } else {
              throw new Error('Failed to fetch vacancy');
            }
            setLoadingVacancy(false);
            return;
          }
          const data = await response.json();
          setVacancy(data);
        } catch (err) {
          console.error('Error fetching vacancy:', err);
          setErrorVacancy('Не удалось загрузить данные вакансии');
        } finally {
          setLoadingVacancy(false);
        }
      };
      fetchVacancy();
    }
  }, [itemId, currentRoute]);

  if (!clinicItem) {
    return (
      <div className="p-4 lg:p-8">
        <div className="text-center">
          <h1 className="text-2xl text-[#2E2E2E] mb-4">Раздел не найден</h1>
          <Button onClick={() => navigate('/clinic')}>
            Вернуться к разделам клиники
          </Button>
        </div>
      </div>
    );
  }

  const breadcrumbItems = [
    { label: 'Главная', href: '/' },
    { label: 'Клиника', href: '/clinic' },
    ...(categoryItem ? [{ label: categoryItem.title, href: `/clinic/${categoryId}` }] : []),
    { label: clinicItem.title, href: currentRoute }
  ];

  // Handle partners page
  if (itemId === 'medical-labs' || itemId === 'insurance' || itemId === 'dental-labs') {
    const categoryMap: Record<string, string> = {
      'medical-labs': 'medical',
      'insurance': 'insurance',
      'dental-labs': 'dental'
    };
    
    const partners = getPartnersByCategory(categoryMap[itemId]);
    
    return (
      <>
        <Breadcrumb items={breadcrumbItems} />
        <div className="p-4 lg:p-8">
          <div className="max-w-6xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-8"
            >
              <h1 className="text-2xl lg:text-3xl text-[#212121] mb-4">{clinicItem.title}</h1>
              <p className="text-[#212121] leading-relaxed text-sm lg:text-base">
                {clinicItem.fullDescription}
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {partners.map((partner) => (
            <Card 
              key={partner.id} 
              className="group hover:shadow-xl transition-all duration-300 cursor-pointer border border-gray-100 hover:border-[#18A36C]/20 h-full"
              onClick={() => navigate(`/clinic/partners/${partner.id}`)}
            >
              <div className="p-6 h-full flex flex-col">
                <div className="mb-4">
                  <ImageWithFallback
                    src={partner.image}
                    alt={partner.name}
                    className="w-full h-32 object-cover rounded-lg"
                  />
                </div>
                <h3 className="text-lg text-[#2E2E2E] mb-2 group-hover:text-[#18A36C] transition-colors duration-300">
                  {partner.name}
                </h3>
                <p className="text-sm text-gray-600 leading-relaxed mb-4 flex-grow">
                  {partner.description}
                </p>
                
                <div className="space-y-2 mb-4">
                  {partner.phone && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Phone className="w-4 h-4" />
                      {partner.phone}
                    </div>
                  )}
                  {partner.website && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Globe className="w-4 h-4" />
                      {partner.website}
                    </div>
                  )}
                </div>
                
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-[#18A36C] hover:text-[#18A36C]/80 hover:bg-[#18A36C]/5 p-0 h-auto group-hover:translate-x-1 transition-all duration-300 w-full justify-start"
                >
                  Подробнее
                  <ExternalLink className="w-4 h-4 ml-[2.5px]" />
                </Button>
              </div>
            </Card>
          ))}
          </div>

          <div className="mt-8 p-6 bg-gradient-to-r from-[#F4F4F4] to-white rounded-2xl border border-gray-100">
            <div className="text-center">
              <HelpCircle className="w-12 h-12 text-[#18A36C] mx-auto mb-3" />
              <h3 className="text-lg text-gray-600 mb-2">Не нашли ответа на свой вопрос?</h3>
              <p className="text-sm text-gray-600 mb-4">
                Свяжитесь с нами, и мы предоставим необходимую информацию.
              </p>
              <Button className="bg-[#18A36C] hover:bg-[#18A36C]/90 text-white">
                <MessageSquare className="w-4 h-4 mr-[2.5px]" />
                Задать вопрос
              </Button>
            </div>
          </div>
          </div>
        </div>
      </>
    );
  }

  // Handle individual partner page
  if (currentRoute.includes('/clinic/partners/') && !['medical-labs', 'insurance', 'dental-labs'].includes(itemId)) {
    const partner = getPartnerById(itemId);
    
    if (!partner) {
      return (
        <div className="p-4 lg:p-8">
          <div className="text-center">
            <h1 className="text-2xl text-[#212121] mb-4">Партнер не найден</h1>
            <Button onClick={() => navigate('/clinic/partners')}>
              Вернуться к партнерам
            </Button>
          </div>
        </div>
      );
    }

    return (
      <>
        <Breadcrumb items={[
          { label: 'Главная', href: '/' },
          { label: 'Клиника', href: '/clinic' },
          { label: 'Партнёры', href: '/clinic/partners' },
          { label: partner.name }
        ]} />
        
        <div className="p-4 lg:p-8">
          <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1">
              <Card className="p-6">
                <div className="mb-4">
                  <ImageWithFallback
                    src={partner.image}
                    alt={partner.name}
                    className="w-full h-48 object-cover rounded-lg"
                  />
                </div>
                <h1 className="text-xl text-[#2E2E2E] mb-4">{partner.name}</h1>
                
                <div className="space-y-3">
                  {partner.phone && (
                    <div className="flex items-center gap-3">
                      <Phone className="w-5 h-5 text-[#18A36C]" />
                      <span className="text-sm">{partner.phone}</span>
                    </div>
                  )}
                  {partner.website && (
                    <div className="flex items-center gap-3">
                      <Globe className="w-5 h-5 text-[#18A36C]" />
                      <a 
                        href={partner.website} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-sm text-[#18A36C] hover:text-[#18A36C]/80 hover:underline"
                      >
                        {partner.website}
                      </a>
                    </div>
                  )}
                </div>
              </Card>
            </div>
            
            <div className="lg:col-span-2">
              <Card className="p-6">
                <h2 className="text-xl text-[#2E2E2E] mb-4">О компании</h2>
                <p className="text-[#212121] leading-relaxed">
                  {partner.description}
                </p>
              </Card>
            </div>
          </div>

          <div className="mt-8 p-6 bg-gradient-to-r from-[#F4F4F4] to-white rounded-2xl border border-gray-100">
            <div className="text-center">
              <HelpCircle className="w-12 h-12 text-[#18A36C] mx-auto mb-3" />
              <h3 className="text-lg text-gray-600 mb-2">Не нашли ответа на свой вопрос?</h3>
              <p className="text-sm text-gray-600 mb-4">
                Свяжитесь с нами, и мы предоставим необходимую информацию.
              </p>
              <Button className="bg-[#18A36C] hover:bg-[#18A36C]/90 text-white">
                <MessageSquare className="w-4 h-4 mr-[2.5px]" />
                Задать вопрос
              </Button>
            </div>
          </div>
        </div>
      </div>
      </>
    );
  }

  if (itemId === 'reviews') {
    const totalPages = Math.ceil(clinicReviews.length / REVIEWS_PER_PAGE);
    const startIndex = (currentPage - 1) * REVIEWS_PER_PAGE;
    const endIndex = startIndex + REVIEWS_PER_PAGE;
    const currentReviews = clinicReviews.slice(startIndex, endIndex);

    return (
      <>
        <Breadcrumb items={breadcrumbItems} />
        
        <div className="p-4 lg:p-8">
          <div className="max-w-6xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6"
            >
              <Button
                variant="ghost"
                onClick={() => navigate('/clinic')}
                className="mb-4 text-gray-600 hover:text-[#18A36C] hover:bg-[#18A36C]/5"
              >
                <ArrowLeft className="w-4 h-4 mr-[2.5px]" />
                Вернуться к разделам клиники
              </Button>
              
              <div className="mb-6">
                <h1 className="text-2xl lg:text-3xl text-[#212121] mb-4">{clinicItem.title}</h1>
                <p className="text-[#212121] leading-relaxed text-sm lg:text-base">
                  {clinicItem.fullDescription}
                </p>
          </div>
        </motion.div>

        <Card className="p-6">
          <div className="mb-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl text-[#2E2E2E]">Отзывы пациентов</h2>
              <div className="text-sm text-gray-600">
                Страница {currentPage} из {totalPages} ({clinicReviews.length} отзывов)
              </div>
            </div>
          </div>
          
          <div className="space-y-6">
            {currentReviews.map((review) => (
              <div key={review.id} className="border-b border-gray-200 last:border-b-0 pb-6 last:pb-0">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-[#18A36C]/10 rounded-full flex items-center justify-center">
                      <span className="text-[#18A36C] font-medium">
                        {review.patientName.charAt(0)}
                      </span>
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium text-[#2E2E2E]">{review.patientName}</h4>
                      </div>
                      <p className="text-sm text-gray-500">{review.date}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${
                          i < review.rating
                            ? 'fill-[#18A36C] text-[#18A36C]'
                            : 'text-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                </div>
                <p className="text-gray-700 leading-relaxed">{review.text}</p>
              </div>
            ))}
          </div>
          
          {totalPages > 1 && (
            <div className="mt-8">
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious 
                      href="#" 
                      onClick={(e) => {
                        e.preventDefault();
                        if (currentPage > 1) setCurrentPage(currentPage - 1);
                      }}
                      className={currentPage === 1 ? 'pointer-events-none opacity-50' : ''}
                    />
                  </PaginationItem>
                  
                  {[...Array(totalPages)].map((_, i) => (
                    <PaginationItem key={i + 1}>
                      <PaginationLink
                        href="#"
                        onClick={(e) => {
                          e.preventDefault();
                          setCurrentPage(i + 1);
                        }}
                        isActive={currentPage === i + 1}
                      >
                        {i + 1}
                      </PaginationLink>
                    </PaginationItem>
                  ))}
                  
                  <PaginationItem>
                    <PaginationNext 
                      href="#" 
                      onClick={(e) => {
                        e.preventDefault();
                        if (currentPage < totalPages) setCurrentPage(currentPage + 1);
                      }}
                      className={currentPage === totalPages ? 'pointer-events-none opacity-50' : ''}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}
        </Card>

        <div className="mt-8 p-6 bg-gradient-to-r from-[#F4F4F4] to-white rounded-2xl border border-gray-100">
          <div className="text-center">
            <HelpCircle className="w-12 h-12 text-[#18A36C] mx-auto mb-3" />
            <h3 className="text-lg text-gray-600 mb-2">Не нашли ответа на свой вопрос?</h3>
            <p className="text-sm text-gray-600 mb-4">
              Свяжитесь с нами, и мы предоставим необходимую информацию.
            </p>
            <Button className="bg-[#18A36C] hover:bg-[#18A36C]/90 text-white">
              <MessageSquare className="w-4 h-4 mr-[2.5px]" />
              Задать вопрос
            </Button>
          </div>
        </div>
        </div>
      </div>
      </>
    );
  }

  if (itemId === 'vacancies') {
    return (
      <>
        <Breadcrumb items={breadcrumbItems} />
        
        <div className="p-4 lg:p-8">
          <div className="max-w-6xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6"
            >
              <Button
                variant="ghost"
                onClick={() => navigate('/clinic')}
                className="mb-4 text-gray-600 hover:text-[#18A36C] hover:bg-[#18A36C]/5"
              >
                <ArrowLeft className="w-4 h-4 mr-[2.5px]" />
                Вернуться к разделам клиники
              </Button>
              
              <div className="mb-6">
                <h1 className="text-2xl lg:text-3xl text-[#212121] mb-4">{clinicItem.title}</h1>
                <p className="text-[#212121] leading-relaxed text-sm lg:text-base">
                  {clinicItem.fullDescription}
                </p>
              </div>
            </motion.div>

            {loadingVacancies ? (
              <div className="text-center py-8">
                <div className="animate-pulse">Загрузка вакансий...</div>
              </div>
            ) : errorVacancies ? (
              <div className="text-center py-8">
                <p className="text-red-600 mb-4">{errorVacancies}</p>
                <Button onClick={() => window.location.reload()}>Попробовать снова</Button>
              </div>
            ) : vacancies.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-600">Вакансии не найдены</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {vacancies.map((vacancy) => (
            <Card key={vacancy.id} className="p-6 hover:shadow-lg transition-all duration-300 h-full flex flex-col">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-lg text-[#2E2E2E] mb-2">{vacancy.title}</h3>
                  <p className="text-sm text-gray-600">{vacancy.department}</p>
                </div>
                <Badge variant={vacancy.type === 'full-time' ? 'default' : 'secondary'} className={vacancy.type === 'full-time' ? 'bg-[#18A36C] text-white' : ''}>
                  {vacancy.type === 'full-time' ? 'Полная занятость' : 
                   vacancy.type === 'part-time' ? 'Неполная занятость' : 'Контракт'}
                </Badge>
              </div>
              
              <p className="text-sm text-gray-700 leading-relaxed mb-4 flex-grow">
                {vacancy.description}
              </p>
              
              <div className="space-y-3 mb-4">
                {vacancy.salary && (
                  <div className="flex items-center gap-2 text-sm">
                    <DollarSign className="w-4 h-4 text-[#18A36C]" />
                    <span>{vacancy.salary}</span>
                  </div>
                )}
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="w-4 h-4 text-[#18A36C]" />
                  <span>Опыт: {vacancy.experience}</span>
                </div>
              </div>
              
              <div className="space-y-3">
                <div>
                  <h4 className="text-sm font-medium text-[#2E2E2E] mb-2">Требования:</h4>
                  <ul className="text-xs text-gray-600 space-y-1">
                    {vacancy.requirements.slice(0, 2).map((req, index) => (
                      <li key={index}>• {req}</li>
                    ))}
                    {vacancy.requirements.length > 2 && (
                      <li className="text-[#18A36C]">... и еще {vacancy.requirements.length - 2}</li>
                    )}
                  </ul>
                </div>
                
                <Button
                  onClick={() => navigate(`/clinic/vacancies/${vacancy.id}`)}
                  className="w-full bg-[#18A36C] hover:bg-[#18A36C]/90 text-white"
                  size="sm"
                >
                  Подробнее
                </Button>
              </div>
            </Card>
                ))}
              </div>
            )}

          {/* Ask Question Footer */}
          <div className="mt-8 p-6 bg-gradient-to-r from-[#F4F4F4] to-white rounded-2xl border border-gray-100">
            <div className="text-center">
              <HelpCircle className="w-12 h-12 text-[#18A36C] mx-auto mb-3" />
              <h3 className="text-lg text-gray-600 mb-2">Не нашли ответа на свой вопрос?</h3>
              <p className="text-sm text-gray-600 mb-4">
                Свяжитесь с нами, и мы предоставим необходимую информацию.
              </p>
              <Button className="bg-[#18A36C] hover:bg-[#18A36C]/90 text-white">
                <MessageSquare className="w-4 h-4 mr-[2.5px]" />
                Задать вопрос
              </Button>
            </div>
          </div>
        </div>
      </div>
      </>
    );
  }

  // Handle individual vacancy page
  if (currentRoute.includes('/clinic/vacancies/') && itemId !== 'vacancies') {
    if (loadingVacancy) {
      return (
        <div className="p-4 lg:p-8">
          <div className="max-w-4xl mx-auto text-center">
            <div className="animate-pulse">Загрузка...</div>
          </div>
        </div>
      );
    }

    if (errorVacancy || !vacancy) {
      return (
        <div className="p-4 lg:p-8">
          <div className="text-center">
            <h1 className="text-2xl text-[#212121] mb-4">
              {errorVacancy || 'Вакансия не найдена'}
            </h1>
            <Button onClick={() => navigate('/clinic/vacancies')}>
              Вернуться к вакансиям
            </Button>
          </div>
        </div>
      );
    }

    return (
      <>
        <Breadcrumb items={[
          { label: 'Главная', href: '/' },
          { label: 'Клиника', href: '/clinic' },
          { label: 'Вакансии', href: '/clinic/vacancies' },
          { label: vacancy.title }
        ]} />
        
        <div className="p-4 lg:p-8">
          <div className="max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6"
            >
          <Button
            variant="ghost"
            onClick={() => navigate('/clinic/vacancies')}
            className="mb-4 text-gray-600 hover:text-[#18A36C] hover:bg-[#18A36C]/5"
          >
            <ArrowLeft className="w-4 h-4 mr-[2.5px]" />
            Вернуться к вакансиям
          </Button>
        </motion.div>

        <div className="max-w-4xl mx-auto">
          <Card className="p-6 lg:p-8">
            <div className="flex items-start justify-between mb-6">
              <div>
                <h1 className="text-2xl lg:text-3xl text-[#2E2E2E] mb-2">{vacancy.title}</h1>
                <p className="text-gray-600 mb-2">{vacancy.department}</p>
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  {vacancy.salary && (
                    <div className="flex items-center gap-1">
                      <DollarSign className="w-4 h-4" />
                      {vacancy.salary}
                    </div>
                  )}
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    Опыт: {vacancy.experience}
                  </div>
                </div>
              </div>
              <Badge variant={vacancy.type === 'full-time' ? 'default' : 'secondary'} className={`shrink-0 ${vacancy.type === 'full-time' ? 'bg-[#18A36C] text-white' : ''}`}>
                {vacancy.type === 'full-time' ? 'Полная занятость' : 
                 vacancy.type === 'part-time' ? 'Неполная занятость' : 'Контракт'}
              </Badge>
            </div>
            
            <div className="space-y-6">
              <div>
                <h2 className="text-lg text-[#2E2E2E] mb-3">Описание вакансии</h2>
                <p className="text-[#212121] leading-relaxed">
                  {vacancy.description}
                </p>
              </div>
              
              <div>
                <h2 className="text-lg text-[#2E2E2E] mb-3">Требования</h2>
                <ul className="space-y-2">
                  {vacancy.requirements.map((req, index) => (
                    <li key={index} className="flex items-start gap-2 text-[#212121]">
                      <span className="text-[#18A36C] mt-1">•</span>
                      {req}
                    </li>
                  ))}
                </ul>
              </div>
              
              <div>
                <h2 className="text-lg text-[#2E2E2E] mb-3">Обязанности</h2>
                <ul className="space-y-2">
                  {vacancy.responsibilities.map((resp, index) => (
                    <li key={index} className="flex items-start gap-2 text-[#212121]">
                      <span className="text-[#18A36C] mt-1">•</span>
                      {resp}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            
            <div className="mt-8 pt-6 border-t border-gray-200">
              <div className="text-center">
                <Button className="bg-[#18A36C] hover:bg-[#18A36C]/90 text-white px-8">
                  <Mail className="w-4 h-4 mr-[2.5px]" />
                  Откликнуться на вакансию
                </Button>
                <p className="text-sm text-gray-600 mt-3">
                  Или свяжитесь с нами по телефону: +375-29-161-01-01
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* Ask Question Footer */}
        <div className="mt-8 p-6 bg-gradient-to-r from-[#F4F4F4] to-white rounded-2xl border border-gray-100">
          <div className="text-center">
            <HelpCircle className="w-12 h-12 text-[#18A36C] mx-auto mb-3" />
            <h3 className="text-lg text-gray-600 mb-2">Не нашли ответа на свой вопрос?</h3>
            <p className="text-sm text-gray-600 mb-4">
              Свяжитесь с нами, и мы предоставим необходимую информацию.
            </p>
            <Button className="bg-[#18A36C] hover:bg-[#18A36C]/90 text-white">
              <MessageSquare className="w-4 h-4 mr-[2.5px]" />
              Задать вопрос
            </Button>
          </div>
        </div>
        </div>
      </div>
      </>
    );
  }

  // Default page layout for other items
  return (
    <>
      <Breadcrumb items={breadcrumbItems} />
      
      <div className="p-4 lg:p-8">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <h1 className="text-2xl lg:text-3xl text-[#212121] mb-4">{clinicItem.title}</h1>
            {clinicItem.description && (
              <p className="text-[#212121] leading-relaxed text-sm lg:text-base">
                {clinicItem.description}
              </p>
            )}
          </motion.div>

      {/* Content based on item type */}
      {itemId === 'licenses' && (
        <Card className="p-6 lg:p-8">
          {clinicItem.gallery && clinicItem.gallery.length > 0 && (
            <div className="mb-6">
              <ImageWithFallback
                src={clinicItem.gallery[0]}
                alt="Лицензия клиники Doctor Family"
                className="w-full max-w-2xl mx-auto rounded-lg shadow-lg"
              />
            </div>
          )}
          
          {clinicItem.content && (
            <div className="bg-[#F4F4F4] p-6 rounded-lg">
              <pre className="whitespace-pre-wrap text-[#212121] leading-relaxed">
                {clinicItem.content}
              </pre>
            </div>
          )}
        </Card>
      )}

      {itemId === 'requisites' && (
        <Card className="p-6 lg:p-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div>
              <h2 className="text-xl text-[#2E2E2E] mb-4">Юридическая информация</h2>
              <div className="space-y-3">
                {clinicItem.content?.split('\n').map((line, index) => {
                  const [label, value] = line.split(':');
                  if (!value) return null;
                  
                  return (
                    <div key={index} className="flex flex-col">
                      <span className="text-sm text-gray-600 mb-1">{label.trim()}</span>
                      <span className="text-[#212121]">{value.trim()}</span>
                    </div>
                  );
                })}
              </div>
            </div>
            
            <div>
              <h2 className="text-xl text-[#2E2E2E] mb-4">Контактная информация</h2>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-[#18A36C] mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-600">Адрес</p>
                    <p className="text-[#212121]">г. Минск, пр-т Победителей, д. 119, пом. 504</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <Phone className="w-5 h-5 text-[#18A36C] mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-600">Телефон</p>
                    <p className="text-[#212121]">+375-29-161-01-01</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <Mail className="w-5 h-5 text-[#18A36C] mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-600">Email</p>
                    <p className="text-[#212121]">smartmedical.by@gmail.com</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <Globe className="w-5 h-5 text-[#18A36C] mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-600">Сайт</p>
                    <p className="text-[#212121]">smartmedical.by</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Card>
      )}

      {clinicItem.children && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {clinicItem.children.map((child) => (
            <Card 
              key={child.id}
              className="group hover:shadow-xl transition-all duration-300 cursor-pointer border border-gray-100 hover:border-[#18A36C]/20"
              onClick={() => navigate(`/clinic/${categoryId}/${child.id}`)}
            >
              <div className="p-6">
                <h3 className="text-lg text-[#2E2E2E] mb-2 group-hover:text-[#18A36C] transition-colors duration-300">
                  {child.title}
                </h3>
                <p className="text-sm text-gray-600 leading-relaxed mb-4">
                  {child.description}
                </p>
                
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-[#18A36C] hover:text-[#18A36C]/80 hover:bg-[#18A36C]/5 p-0 h-auto group-hover:translate-x-1 transition-all duration-300"
                >
                  Подробнее
                  <ArrowLeft className="w-4 h-4 ml-[2.5px] rotate-180" />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {clinicItem.faq && (
        <Card className="p-6 lg:p-8">
          <h2 className="text-xl text-[#2E2E2E] mb-6">Часто задаваемые вопросы</h2>
          <Accordion type="single" collapsible className="w-full">
            {clinicItem.faq.map((item, index) => (
              <AccordionItem key={index} value={`item-${index}`}>
                <AccordionTrigger className="text-left text-[#212121] hover:text-[#18A36C]">
                  {item.question}
                </AccordionTrigger>
                <AccordionContent className="text-[#212121] leading-relaxed">
                  {item.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </Card>
      )}

      <div className="mt-8 p-6 bg-gradient-to-r from-[#F4F4F4] to-white rounded-2xl border border-gray-100">
        <div className="text-center">
          <HelpCircle className="w-12 h-12 text-[#18A36C] mx-auto mb-3" />
          <h3 className="text-lg text-gray-600 mb-2">Не нашли ответа на свой вопрос?</h3>
          <p className="text-sm text-gray-600 mb-4">
            Свяжитесь с нами, и мы предоставим необходимую информацию.
          </p>
          <Button className="bg-[#18A36C] hover:bg-[#18A36C]/90 text-white">
            <MessageSquare className="w-4 h-4 mr-[2.5px]" />
            Задать вопрос
          </Button>
        </div>
      </div>
      </div>
    </div>
    </>
  );
}