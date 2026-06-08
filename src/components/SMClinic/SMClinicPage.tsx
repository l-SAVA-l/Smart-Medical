import { useState, useEffect } from 'react';
import { Star, FileText, MessageSquare, HelpCircle, ExternalLink, Phone, Globe, MapPin, Mail, Calendar, Building2, Users, DollarSign, Clock, Briefcase, ArrowLeft } from 'lucide-react';
import { Button } from '../common/SMButton/SMButton';
import { Card } from '../common/SMCard/SMCard';
import { Badge } from '../common/SMBadge/SMBadge';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/common/SMAccordion/SMAccordion';
import { Pagination } from '@/components/common/SMPagination/SMPagination';
import { getClinicItemById, ClinicItem, Review } from '../../data/SMClinicData/SMClinicData';
import { useRouter } from '@/components/SMRouter/SMRouter';
import { ImageWithFallback } from '../SMImage/ImageWithFallback';
import { PartnerModal } from './SMPartnerModal';
import { VacancyModal } from './SMVacancyModal';
import { LeaveReviewModal } from './LeaveReviewModal';
import { useContacts } from '@/hooks/useContacts';
import { AskQuestionModal } from '../AskQuestionModal/AskQuestionModal';
import { useAskQuestionModal } from '@/hooks/useAskQuestionModal';
import { useUrlPagination } from '@/hooks/useUrlPagination';
import {
  PartnersListSkeleton,
  SinglePartnerSkeleton,
  VacanciesListSkeleton,
  SingleVacancySkeleton,
  ReviewsPageSkeleton,
  FAQPageSkeleton,
  PartnerCardSkeleton,
  VacancyCardSkeleton,
  ReviewItemSkeleton,
  FAQItemSkeleton
} from './SMClinicSkeleton';

// Types from API
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

interface PartnerCategorySummary {
  slug: string;
  name: string;
  count: number;
}

interface Vacancy {
  id: number;
  name: string;
  category: string;
  description: string;
  payment: number;
  experience: number;
  requirements: string;
}

interface ClinicReview {
  id: number;
  name: string;
  text: string;
  date: Date | string;
  grade: number;
  verified: boolean;
  image_url: string | null;
}

interface ClinicFaq {
  id: number;
  question: string;
  answer: string | null;
  category: string | null;
}

interface ClinicPageProps {
  itemId: string;
  categoryId: string;
}

const REVIEWS_PER_PAGE = 10;
const VACANCIES_PER_PAGE = 6;
const PARTNERS_PER_PAGE = 6;

// Компонент скелетона для текста
function TextSkeleton({ className = '' }: { className?: string }) {
  return <span className={`inline-block animate-pulse bg-gray-200 rounded ${className}`}>&nbsp;</span>;
}

export function ClinicPage({ itemId, categoryId }: ClinicPageProps) {
  const [activeTab, setActiveTab] = useState('info');
  const { currentPage: reviewsPage, setPage: setReviewsPage } = useUrlPagination(REVIEWS_PER_PAGE);
  const { currentPage: vacanciesPage, setPage: setVacanciesPage } = useUrlPagination(VACANCIES_PER_PAGE);
  const [partnersPage, setPartnersPage] = useState(1);
  const [partners, setPartners] = useState<Partner[]>([]);
  const [vacancies, setVacancies] = useState<Vacancy[]>([]);
  const [vacanciesTotal, setVacanciesTotal] = useState(0);
  const [singlePartner, setSinglePartner] = useState<Partner | null>(null);
  const [partnerCategories, setPartnerCategories] = useState<PartnerCategorySummary[]>([]);
  const [singleVacancy, setSingleVacancy] = useState<Vacancy | null>(null);
  const [clinicReviewsData, setClinicReviewsData] = useState<ClinicReview[]>([]);
  const [clinicFaqsData, setClinicFaqsData] = useState<ClinicFaq[]>([]);
  const askQuestionModal = useAskQuestionModal();
  const [reviewsTotal, setReviewsTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [faqLoading, setFaqLoading] = useState(false);
  const [selectedPartner, setSelectedPartner] = useState<Partner | null>(null);
  const [selectedVacancy, setSelectedVacancy] = useState<Vacancy | null>(null);
  const [isPartnerModalOpen, setIsPartnerModalOpen] = useState(false);
  const [isVacancyModalOpen, setIsVacancyModalOpen] = useState(false);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const { navigate, currentRoute } = useRouter();
  const { contacts, loading: contactsLoading } = useContacts();

  const clinicItem = getClinicItemById(itemId);
  const categoryItem = categoryId !== itemId ? getClinicItemById(categoryId) : null;
  const isPartnerCategoryRoute =
    categoryId === 'partners' && itemId !== 'partners' && isNaN(Number(itemId));
  const selectedPartnerCategory = partnerCategories.find((c) => c.slug === itemId) || null;

  useEffect(() => {
    // Проверяем наличие якоря в URL
    const hash = window.location.hash;
    if (hash) {
      // Задержка для загрузки контента
      setTimeout(() => {
        const element = document.getElementById(hash.substring(1));
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
          // Если это FAQ - открываем аккордеон
          if (hash.startsWith('#faq-')) {
            const trigger = element.querySelector('button[data-state]');
            if (trigger) {
              (trigger as HTMLButtonElement).click();
            }
          }
        }
      }, 500);
    } else {
      window.scrollTo(0, 0);
    }
  }, [itemId, categoryId]);

  // Load partner categories dynamically from DB
  useEffect(() => {
    const shouldLoadPartnerCategories =
      itemId === 'partners' || categoryId === 'partners' || currentRoute.includes('/clinic/partners');

    if (!shouldLoadPartnerCategories) return;

    fetch('/api/partners')
      .then(res => res.json())
      .then((data: Partner[]) => {
        const grouped = new Map<string, PartnerCategorySummary>();
        for (const partner of data) {
          const slug = partner.category?.slug;
          const name = partner.category?.name;
          if (!slug || !name) continue;
          const existing = grouped.get(slug);
          if (existing) {
            existing.count += 1;
          } else {
            grouped.set(slug, { slug, name, count: 1 });
          }
        }
        setPartnerCategories(Array.from(grouped.values()).sort((a, b) => a.name.localeCompare(b.name, 'ru')));
      })
      .catch(() => setPartnerCategories([]));
  }, [itemId, categoryId, currentRoute]);

  // Load partners for partner category pages
  useEffect(() => {
    if (isPartnerCategoryRoute) {
      setLoading(true);
      fetch(`/api/partners?category=${itemId}`)
        .then(res => res.json())
        .then(data => setPartners(data))
        .finally(() => setLoading(false));
    }
  }, [itemId, isPartnerCategoryRoute]);

  // Load single partner
  useEffect(() => {
    if (categoryId === 'partners' && !isNaN(Number(itemId))) {
      setLoading(true);
      fetch(`/api/partners/${itemId}`)
        .then(res => res.json())
        .then(data => setSinglePartner(data))
        .finally(() => setLoading(false));
    }
  }, [itemId, categoryId]);

  // Load vacancies
  useEffect(() => {
    if (itemId === 'vacancies') {
      setLoading(true);
      fetch(`/api/vacancies?page=${vacanciesPage}&limit=${VACANCIES_PER_PAGE}`)
        .then(res => res.json())
        .then(data => {
          setVacancies(data.vacancies || data);
          setVacanciesTotal(data.pagination?.total || data.length || 0);
          // Smooth scroll to top on page change
          window.scrollTo({ top: 0, behavior: 'smooth' });
        })
        .finally(() => setLoading(false));
    }
  }, [itemId, vacanciesPage]);

  // Load clinic reviews
  useEffect(() => {
    if (itemId === 'reviews') {
      setLoading(true);
      fetch(`/api/clinic-reviews?page=${reviewsPage}&limit=${REVIEWS_PER_PAGE}`)
        .then(res => res.json())
        .then(data => {
          setClinicReviewsData(data.reviews);
          setReviewsTotal(data.pagination.total);
          // Smooth scroll to top on page change
          window.scrollTo({ top: 0, behavior: 'smooth' });
        })
        .finally(() => setLoading(false));
    }
  }, [itemId, reviewsPage]);

  // Load clinic FAQs for specific categories
  useEffect(() => {
    const faqCategories = ['children-teeth', 'girls-hygiene', 'boys-hygiene', 'girls-puberty',
      'culdocentesis', 'stomatology', 'polyp-removal', 'ultrasound',
      'womens-health', 'curettage'];

    if (faqCategories.includes(itemId)) {
      setFaqLoading(true);
      fetch(`/api/clinic-faqs?category=${itemId}`)
        .then(res => res.json())
        .then(data => setClinicFaqsData(data))
        .finally(() => setFaqLoading(false));
    }
  }, [itemId]);

  // Load single vacancy
  useEffect(() => {
    if (categoryId === 'vacancies' && !isNaN(Number(itemId))) {
      setLoading(true);
      fetch(`/api/vacancies/${itemId}`)
        .then(res => res.json())
        .then(data => setSingleVacancy(data))
        .finally(() => setLoading(false));
    }
  }, [itemId, categoryId]);

  if (!clinicItem && !isPartnerCategoryRoute) {
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

  // Handle partner category page (dynamic slug)
  if (isPartnerCategoryRoute) {
    return (
      <>
        <div className="p-4 lg:p-8">
          <div className="max-w-6xl mx-auto">
            <div
              className="mb-8"
            >
              <h1 className="text-2xl lg:text-3xl text-[#212121] mb-4">
                {selectedPartnerCategory?.name || 'Партнёры'}
              </h1>
              <p className="text-[#212121] leading-relaxed text-sm lg:text-base">
                Партнёры выбранной категории
              </p>
            </div>

            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <PartnerCardSkeleton key={i} />
                ))}
              </div>
            ) : partners.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 px-4">
                <div className="w-20 h-20 bg-gray-100 rounded-2xl flex items-center justify-center mb-6">
                  <Users className="w-10 h-10 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-700 mb-2">Партнёры не найдены</h3>
                <p className="text-gray-500 text-center max-w-md mb-6">
                  В данной категории пока нет партнёров. Мы работаем над расширением списка наших партнёров.
                </p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {partners
                    .slice((partnersPage - 1) * PARTNERS_PER_PAGE, partnersPage * PARTNERS_PER_PAGE)
                    .map((partner) => (
                      <Card
                        key={partner.id}
                        id={`partner-${partner.id}`}
                        className="group hover:shadow-xl transition-all duration-300 border border-gray-200 hover:border-[#18A36C] h-full scroll-mt-24"
                      >
                        <div className="p-6 h-full flex flex-col">
                          <div className="mb-4">
                            <ImageWithFallback
                              src={partner.image_url}
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
                            {partner.website_url && (
                              <div className="flex items-center gap-2 text-sm text-gray-600">
                                <Globe className="w-4 h-4" />
                                {partner.website_url}
                              </div>
                            )}
                          </div>

                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setSelectedPartner(partner);
                              setIsPartnerModalOpen(true);
                            }}
                            className="text-[#18A36C] hover:text-[#18A36C]/80 hover:bg-[#18A36C]/5 p-0 h-auto group-hover:translate-x-1 transition-all duration-300 w-full justify-start"
                          >
                            Подробнее
                            <ExternalLink className="w-4 h-4 ml-[2.5px]" />
                          </Button>
                        </div>
                      </Card>
                    ))}
                </div>

                {/* Pagination for partners */}
                {partners.length > PARTNERS_PER_PAGE && (
                  <Pagination
                    currentPage={partnersPage}
                    totalPages={Math.ceil(partners.length / PARTNERS_PER_PAGE)}
                    onPageChange={setPartnersPage}
                    className="mt-8"
                  />
                )}
              </>
            )}
          </div>

          <div className="mt-8 p-6 bg-[#F4F4F4] rounded-2xl border border-gray-100">
            <div className="text-center">
              <HelpCircle className="w-12 h-12 text-[#18A36C] mx-auto mb-3" />
              <h3 className="text-lg text-gray-600 mb-2">Не нашли ответа на свой вопрос?</h3>
              <p className="text-sm text-gray-600 mb-4">
                Свяжитесь с нами, и мы предоставим необходимую информацию.
              </p>
              <Button
                onClick={askQuestionModal.open}
                className="bg-[#18A36C] hover:bg-[#18A36C]/90 text-white"
              >
                <MessageSquare className="w-4 h-4 mr-[2.5px]" />
                Задать вопрос
              </Button>
            </div>
          </div>
        </div>

        {/* Partner Modal */}
        <PartnerModal
          partner={selectedPartner}
          open={isPartnerModalOpen}
          onOpenChange={setIsPartnerModalOpen}
        />

        {/* Ask Question Modal */}
        <AskQuestionModal
          isOpen={askQuestionModal.isOpen}
          onClose={askQuestionModal.close}
          onComplete={() => {
          }}
        />
      </>
    );
  }

  // Handle individual partner page
  if (currentRoute.includes('/clinic/partners/') && !['medical-labs', 'insurance', 'dental-labs'].includes(itemId)) {
    if (loading) {
      return <SinglePartnerSkeleton />;
    }

    if (!singlePartner) {
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
        <div className="p-4 lg:p-8">
          <div className="max-w-4xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-1">
                <Card className="p-6">
                  <div className="mb-4">
                    <ImageWithFallback
                      src={singlePartner.image_url}
                      alt={singlePartner.name}
                      className="w-full h-48 object-cover rounded-lg"
                    />
                  </div>
                  <h1 className="text-xl text-[#2E2E2E] mb-4">{singlePartner.name}</h1>

                  <div className="space-y-3">
                    {singlePartner.website_url && (
                      <div className="flex items-center gap-3">
                        <Globe className="w-5 h-5 text-[#18A36C]" />
                        <a
                          href={singlePartner.website_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-[#18A36C] hover:text-[#18A36C]/80 hover:underline"
                        >
                          {singlePartner.website_url}
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
                    {singlePartner.description}
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
                <Button
                  onClick={askQuestionModal.open}
                  className="bg-[#18A36C] hover:bg-[#18A36C]/90 text-white"
                >
                  <MessageSquare className="w-4 h-4 mr-[2.5px]" />
                  Задать вопрос
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Ask Question Modal */}
        <AskQuestionModal
          isOpen={askQuestionModal.isOpen}
          onClose={askQuestionModal.close}
          onComplete={() => {
          }}
        />
      </>
    );
  }

  if (itemId === 'reviews') {
    const totalPages = Math.ceil(reviewsTotal / REVIEWS_PER_PAGE);
    const currentReviews = clinicReviewsData;

    return (
      <>
        <div className="p-4 lg:p-8">
          <div className="max-w-6xl mx-auto">
            <div
              className="mb-6"
            >
              <div className="mb-6">
                <h1 className="text-2xl lg:text-3xl text-[#212121] mb-4">{clinicItem.title}</h1>
                <p className="text-[#212121] leading-relaxed text-sm lg:text-base">
                  {clinicItem.fullDescription}
                </p>
              </div>
            </div>

            <Card className="p-6 border-gray-200">
              <div className="mb-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl text-[#2E2E2E]">Отзывы пациентов</h2>
                  {!loading && (
                    <div className="text-sm text-gray-600">
                      Страница {reviewsPage} из {totalPages} ({reviewsTotal} отзывов)
                    </div>
                  )}
                </div>
              </div>

              {loading ? (
                <div className="space-y-6">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <ReviewItemSkeleton key={i} />
                  ))}
                </div>
              ) : currentReviews.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 px-4">
                  <div className="w-20 h-20 bg-gray-100 rounded-2xl flex items-center justify-center mb-6">
                    <Star className="w-10 h-10 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-700 mb-2">Отзывы не найдены</h3>
                  <p className="text-gray-500 text-center max-w-md mb-6">
                    Пока нет отзывов о клинике. Станьте первым, кто поделится своим опытом!
                  </p>
                  <Button
                    onClick={() => setIsReviewModalOpen(true)}
                    className="bg-[#18A36C] hover:bg-[#15905f] text-white shadow-lg shadow-[#18A36C]/20"
                  >
                    <MessageSquare className="w-4 h-4 mr-2" />
                    Оставить первый отзыв
                  </Button>
                </div>
              ) : (
                <>
                  <div className="space-y-6">
                    {currentReviews.map((review) => {
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
                                <div className="flex items-center gap-2">
                                  <h4 className="font-medium text-[#2E2E2E]">{review.name}</h4>
                                </div>
                                <p className="text-sm text-gray-500">{new Date(review.date).toLocaleDateString('ru-RU', {
                                  day: 'numeric',
                                  month: 'long',
                                  year: 'numeric',
                                })}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-1">
                              {[...Array(5)].map((_, i) => (
                                <Star
                                  key={i}
                                  className={`w-4 h-4 ${i < review.grade
                                    ? 'fill-yellow-400 text-yellow-400'
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
                  </div>

                  {/* Pagination for reviews */}
                  <Pagination
                    currentPage={reviewsPage}
                    totalPages={totalPages}
                    onPageChange={setReviewsPage}
                    className="mt-8"
                  />
                </>
              )}
            </Card>

            <div className="mt-8 p-6 bg-[#18A36C]/5 rounded-2xl border border-[#18A36C]/20">
              <div className="text-center">
                <Star className="w-12 h-12 text-[#18A36C] mx-auto mb-3" />
                <h3 className="text-lg font-medium text-gray-800 mb-2">Поделитесь своим мнением</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Ваш отзыв поможет нам стать лучше и поможет другим пациентам сделать правильный выбор.
                </p>
                <Button
                  onClick={() => setIsReviewModalOpen(true)}
                  className="bg-[#18A36C] hover:bg-[#15905f] text-white shadow-lg shadow-[#18A36C]/20"
                >
                  <MessageSquare className="w-4 h-4 mr-2" />
                  Оставить отзыв
                </Button>
              </div>
            </div>

            {/* Leave Review Modal */}
            <LeaveReviewModal
              isOpen={isReviewModalOpen}
              onClose={() => setIsReviewModalOpen(false)}
            />
          </div>
        </div>
      </>
    );
  }

  if (itemId === 'vacancies') {
    return (
      <>
        <div className="p-4 lg:p-8">
          <div className="max-w-6xl mx-auto">
            <div
              className="mb-6"
            >
              <div className="mb-6">
                <h1 className="text-2xl lg:text-3xl text-[#212121] mb-4">{clinicItem.title}</h1>
                <p className="text-[#212121] leading-relaxed text-sm lg:text-base">
                  {clinicItem.fullDescription}
                </p>
              </div>
            </div>

            {loading ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <VacancyCardSkeleton key={i} />
                ))}
              </div>
            ) : vacancies.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 px-4">
                <div className="w-20 h-20 bg-gray-100 rounded-2xl flex items-center justify-center mb-6">
                  <Briefcase className="w-10 h-10 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-700 mb-2">Вакансии не найдены</h3>
                <p className="text-gray-500 text-center max-w-md mb-6">
                  В данный момент нет открытых вакансий. Следите за обновлениями или отправьте своё резюме на будущее.
                </p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {vacancies.map((vacancy) => (
                    <Card
                      key={vacancy.id}
                      id={`vacancy-${vacancy.id}`}
                      className="p-6 hover:shadow-lg transition-all duration-300 h-full flex flex-col border-gray-200 hover:border-[#18A36C] scroll-mt-24"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="text-lg text-[#2E2E2E] mb-2">{vacancy.name}</h3>
                          <p className="text-sm text-gray-600">{vacancy.category}</p>
                        </div>
                      </div>

                      <p className="text-sm text-gray-700 leading-relaxed mb-4 flex-grow">
                        {vacancy.description}
                      </p>

                      <div className="space-y-3 mb-4">
                        <div className="flex items-center gap-2 text-sm">
                          <DollarSign className="w-4 h-4 text-[#18A36C]" />
                          <span>{vacancy.payment} BYN</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <Clock className="w-4 h-4 text-[#18A36C]" />
                          <span>Опыт: {vacancy.experience} {vacancy.experience === 1 ? 'год' : 'лет'}</span>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <div>
                          <h4 className="text-sm font-medium text-[#2E2E2E] mb-2">Требования:</h4>
                          <p className="text-xs text-gray-600">{vacancy.requirements}</p>
                        </div>

                        <Button
                          onClick={() => {
                            setSelectedVacancy(vacancy);
                            setIsVacancyModalOpen(true);
                          }}
                          className="w-full bg-[#18A36C] hover:bg-[#18A36C]/90 text-white"
                          size="sm"
                        >
                          Подробнее
                        </Button>
                      </div>
                    </Card>
                  ))}
                </div>

                {/* Pagination for vacancies */}
                {vacanciesTotal > VACANCIES_PER_PAGE && (
                  <Pagination
                    currentPage={vacanciesPage}
                    totalPages={Math.ceil(vacanciesTotal / VACANCIES_PER_PAGE)}
                    onPageChange={setVacanciesPage}
                    className="mt-8"
                  />
                )}
              </>
            )}

            {/* Ask Question Footer */}
            <div className="mt-8 p-6 bg-gradient-to-r from-[#F4F4F4] to-white rounded-2xl border border-gray-100">
              <div className="text-center">
                <HelpCircle className="w-12 h-12 text-[#18A36C] mx-auto mb-3" />
                <h3 className="text-lg text-gray-600 mb-2">Не нашли ответа на свой вопрос?</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Свяжитесь с нами, и мы предоставим необходимую информацию.
                </p>
                <Button
                  onClick={askQuestionModal.open}
                  className="bg-[#18A36C] hover:bg-[#18A36C]/90 text-white"
                >
                  <MessageSquare className="w-4 h-4 mr-[2.5px]" />
                  Задать вопрос
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Vacancy Modal */}
        <VacancyModal
          vacancy={selectedVacancy}
          open={isVacancyModalOpen}
          onOpenChange={setIsVacancyModalOpen}
        />
      </>
    );
  }

  // Handle individual vacancy page
  if (currentRoute.includes('/clinic/vacancies/') && itemId !== 'vacancies') {
    if (loading) {
      return <SingleVacancySkeleton />;
    }

    if (!singleVacancy) {
      return (
        <div className="p-4 lg:p-8">
          <div className="text-center">
            <h1 className="text-2xl text-[#212121] mb-4">Вакансия не найдена</h1>
            <Button onClick={() => navigate('/clinic/vacancies')}>
              Вернуться к вакансиям
            </Button>
          </div>
        </div>
      );
    }

    return (
      <>
        <div className="p-4 lg:p-8">
          <div className="max-w-4xl mx-auto">
            <Card className="p-6 lg:p-8">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h1 className="text-2xl lg:text-3xl text-[#2E2E2E] mb-2">{singleVacancy.name}</h1>
                  <p className="text-gray-600 mb-2">{singleVacancy.category}</p>
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                      <DollarSign className="w-4 h-4" />
                      {singleVacancy.payment} BYN
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      Опыт: {singleVacancy.experience} {singleVacancy.experience === 1 ? 'год' : 'лет'}
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <h2 className="text-lg text-[#2E2E2E] mb-3">Описание вакансии</h2>
                  <p className="text-[#212121] leading-relaxed">
                    {singleVacancy.description}
                  </p>
                </div>

                <div>
                  <h2 className="text-lg text-[#2E2E2E] mb-3">Требования</h2>
                  <p className="text-[#212121] leading-relaxed">
                    {singleVacancy.requirements}
                  </p>
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

            {/* Ask Question Footer */}
            <div className="mt-8 p-6 bg-gradient-to-r from-[#F4F4F4] to-white rounded-2xl border border-gray-100">
              <div className="text-center">
                <HelpCircle className="w-12 h-12 text-[#18A36C] mx-auto mb-3" />
                <h3 className="text-lg text-gray-600 mb-2">Не нашли ответа на свой вопрос?</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Свяжитесь с нами, и мы предоставим необходимую информацию.
                </p>
                <Button
                  onClick={askQuestionModal.open}
                  className="bg-[#18A36C] hover:bg-[#18A36C]/90 text-white"
                >
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

  // Handle partners root page - show dynamic subcategories from DB
  if (itemId === 'partners' && clinicItem?.children) {
    return (
      <>
        <div className="p-4 lg:p-8">
          <div className="max-w-6xl mx-auto">
            <div className="mb-8">
              <h1 className="text-2xl lg:text-3xl text-[#212121] mb-4">{clinicItem.title}</h1>
              <p className="text-[#212121] leading-relaxed text-sm lg:text-base">
                {clinicItem.description}
              </p>
            </div>

            {/* Категории партнёров */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {partnerCategories.map((category) => (
                <Card
                  key={category.slug}
                  className="group hover:shadow-xl transition-all duration-300 border border-gray-200 hover:border-[#18A36C] cursor-pointer"
                  onClick={() => navigate(`/clinic/partners/${category.slug}`)}
                >
                  <div className="p-6">
                    <h3 className="text-xl text-[#2E2E2E] mb-3 group-hover:text-[#18A36C] transition-colors duration-300">
                      {category.name}
                    </h3>
                    <p className="text-sm text-gray-600 leading-relaxed">
                      {category.count} {category.count === 1 ? 'партнёр' : category.count < 5 ? 'партнёра' : 'партнёров'}
                    </p>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </>
    );
  }

  // Handle questions - note: the main questions page is handled by /clinic/questions/page.tsx
  // Individual category pages like /clinic/questions/[slug] are also separate routes
  // This component (SMClinicPage) handles other clinic items through /clinic/[...slug]

  // Default page layout for other items
  return (
    <>
      <div className="p-4 lg:p-8">
        <div className="max-w-6xl mx-auto">
          <div
            className="mb-8"
          >
            <h1 className="text-2xl lg:text-3xl text-[#212121] mb-4">{clinicItem.title}</h1>
            {clinicItem.description && (
              <p className="text-[#212121] leading-relaxed text-sm lg:text-base">
                {clinicItem.description}
              </p>
            )}
          </div>

          {/* Content based on item type */}
          {itemId === 'licenses' && (
            <Card className="p-6 border-gray-200">
              <h2 className="text-xl text-[#2E2E2E] mb-6 flex items-center gap-2">
                <FileText className="w-5 h-5 text-[#18A36C]" />
                Информация о лицензии
              </h2>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Изображение лицензии */}
                {clinicItem.gallery && clinicItem.gallery.length > 0 ? (
                  <div className="space-y-4">
                    <ImageWithFallback
                      src={clinicItem.gallery[0]}
                      alt="Лицензия клиники Doctor Family"
                      className="w-full rounded-lg shadow-lg border border-gray-200 cursor-pointer hover:shadow-xl transition-shadow duration-300"
                      onClick={() => window.open(clinicItem.gallery![0], '_blank', 'noopener,noreferrer')}
                    />
                    <p className="text-xs text-gray-500 text-center">Нажмите на изображение для увеличения</p>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-12 bg-gray-50 rounded-lg border border-gray-200">
                    <FileText className="w-12 h-12 text-gray-300 mb-3" />
                    <p className="text-sm text-gray-500">Изображение лицензии недоступно</p>
                  </div>
                )}

                {/* Текстовая информация */}
                <div>
                  {clinicItem.content ? (
                    <div className="bg-[#F4F4F4] p-6 rounded-lg h-full">
                      <pre className="whitespace-pre-wrap text-[#212121] leading-relaxed text-sm">
                        {clinicItem.content}
                      </pre>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center h-full bg-gray-50 rounded-lg border border-gray-200">
                      <p className="text-sm text-gray-500">Информация о лицензии отсутствует</p>
                    </div>
                  )}
                </div>
              </div>
            </Card>
          )}

          {itemId === 'requisites' && (
            <Card className="p-6 lg:p-8 border-gray-200">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div>
                  <h2 className="text-xl text-[#2E2E2E] mb-4">Юридическая информация</h2>
                  <div className="space-y-3">
                    <div className="flex flex-col">
                      <span className="text-sm text-gray-600 mb-1">Полное наименование</span>
                      <span className="text-[#212121]">Общество с ограниченной ответственностью "Доктор Фемели"</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-sm text-gray-600 mb-1">Сокращенное наименование</span>
                      <span className="text-[#212121]">ООО "Доктор Фемели"</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-sm text-gray-600 mb-1">УНП</span>
                      <span className="text-[#212121]">391788009</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-sm text-gray-600 mb-1">Юридический адрес</span>
                      {contactsLoading ? (
                        <TextSkeleton className="w-64 h-5" />
                      ) : (
                        <a
                          href={`https://yandex.ru/maps/?text=${encodeURIComponent(contacts?.address || 'г. Минск, пр-т Победителей, д. 119, пом. 504')}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[#212121] hover:text-[#18A36C] transition-colors cursor-pointer"
                        >
                          {contacts?.address || 'г. Минск, пр-т Победителей, д. 119, пом. 504'}
                        </a>
                      )}
                    </div>
                    <div className="flex flex-col">
                      <span className="text-sm text-gray-600 mb-1">Фактический адрес</span>
                      {contactsLoading ? (
                        <TextSkeleton className="w-64 h-5" />
                      ) : (
                        <a
                          href={`https://yandex.ru/maps/?text=${encodeURIComponent(contacts?.address || 'г. Минск, пр-т Победителей, д. 119, пом. 504')}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[#212121] hover:text-[#18A36C] transition-colors cursor-pointer"
                        >
                          {contacts?.address || 'г. Минск, пр-т Победителей, д. 119, пом. 504'}
                        </a>
                      )}
                    </div>
                    <div className="flex flex-col">
                      <span className="text-sm text-gray-600 mb-1">Расчётный счёт</span>
                      <span className="text-[#212121]">BY67 BPSB 3012 3410 2901 4933 0000</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-sm text-gray-600 mb-1">Банк</span>
                      <span className="text-[#212121]">ОАО "Сбер Банк"</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-sm text-gray-600 mb-1">Электронная почта</span>
                      {contactsLoading ? (
                        <TextSkeleton className="w-48 h-5" />
                      ) : (
                        <a
                          href={`mailto:${contacts?.email || 'smartmedical.by@gmail.com'}`}
                          className="text-[#212121] hover:text-[#18A36C] transition-colors cursor-pointer"
                        >
                          {contacts?.email || 'smartmedical.by@gmail.com'}
                        </a>
                      )}
                    </div>
                  </div>
                </div>

                <div>
                  <h2 className="text-xl text-[#2E2E2E] mb-4">Контактная информация</h2>
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <MapPin className="w-5 h-5 text-[#18A36C] mt-0.5" />
                      <div>
                        <p className="text-sm text-gray-600">Адрес</p>
                        {contactsLoading ? (
                          <TextSkeleton className="w-64 h-5" />
                        ) : (
                          <a
                            href={`https://yandex.ru/maps/?text=${encodeURIComponent(contacts?.address || 'г. Минск, пр-т Победителей, д. 119, пом. 504')}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[#212121] hover:text-[#18A36C] transition-colors cursor-pointer block"
                          >
                            {contacts?.address || 'г. Минск, пр-т Победителей, д. 119, пом. 504'}
                          </a>
                        )}
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <Phone className="w-5 h-5 text-[#18A36C] mt-0.5" />
                      <div>
                        <p className="text-sm text-gray-600">Телефоны</p>
                        {contactsLoading ? (
                          <div className="space-y-1">
                            <TextSkeleton className="w-36 h-5" />
                            <TextSkeleton className="w-36 h-5" />
                          </div>
                        ) : (
                          <div className="space-y-1">
                            <a
                              href={`tel:${(contacts?.phone_number || '+375296320707').replace(/[\s\-]/g, '')}`}
                              className="text-[#212121] hover:text-[#18A36C] transition-colors cursor-pointer block"
                            >
                              {contacts?.phone_number || '+375296320707'}
                            </a>
                            {contacts?.phone_number_sec && (
                              <a
                                href={`tel:${contacts.phone_number_sec.replace(/[\s\-]/g, '')}`}
                                className="text-[#212121] hover:text-[#18A36C] transition-colors cursor-pointer block"
                              >
                                {contacts.phone_number_sec}
                              </a>
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <Mail className="w-5 h-5 text-[#18A36C] mt-0.5" />
                      <div>
                        <p className="text-sm text-gray-600">Email</p>
                        {contactsLoading ? (
                          <TextSkeleton className="w-48 h-5" />
                        ) : (
                          <a
                            href={`mailto:${contacts?.email || 'smartmedical.by@gmail.com'}`}
                            className="text-[#212121] hover:text-[#18A36C] transition-colors cursor-pointer block"
                          >
                            {contacts?.email || 'smartmedical.by@gmail.com'}
                          </a>
                        )}
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

          {faqLoading ? (
            <Card className="p-6 lg:p-8 border-gray-200">
              <h2 className="text-xl text-[#2E2E2E] mb-6">Часто задаваемые вопросы</h2>
              <div className="space-y-4">
                {[1, 2, 3, 4].map((i) => (
                  <FAQItemSkeleton key={i} />
                ))}
              </div>
            </Card>
          ) : clinicFaqsData.length > 0 ? (
            <Card className="p-6 lg:p-8 border-gray-200">
              <h2 className="text-xl text-[#2E2E2E] mb-6">Часто задаваемые вопросы</h2>
              <Accordion type="single" collapsible className="w-full">
                {clinicFaqsData.map((item) => (
                  <AccordionItem
                    key={item.id}
                    value={`item-${item.id}`}
                    id={`faq-${item.id}`}
                    className="scroll-mt-24"
                  >
                    <AccordionTrigger className="text-left text-[#212121] hover:text-[#18A36C] cursor-pointer">
                      {item.question}
                    </AccordionTrigger>
                    <AccordionContent className="text-[#212121] leading-relaxed">
                      {item.answer}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </Card>
          ) : (
            <Card className="p-6 lg:p-8 border-gray-200">
              <h2 className="text-xl text-[#2E2E2E] mb-6">Часто задаваемые вопросы</h2>
              <div className="text-center py-12 sm:py-16 bg-gradient-to-br from-gray-50 to-white rounded-2xl border border-gray-100">
                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <HelpCircle className="w-8 h-8 sm:w-10 sm:h-10 text-gray-400" />
                </div>
                <h3 className="text-lg sm:text-xl text-gray-800 mb-2">Вопросы отсутствуют</h3>
                <p className="text-sm sm:text-base text-gray-600 max-w-md mx-auto px-4">
                  В данный момент нет часто задаваемых вопросов по этой теме.
                </p>
              </div>
            </Card>
          )}

          <div className="mt-8 p-6 bg-[#F4F4F4] rounded-2xl border border-gray-100">
            <div className="text-center">
              <HelpCircle className="w-12 h-12 text-[#18A36C] mx-auto mb-3" />
              <h3 className="text-lg text-gray-600 mb-2">Не нашли ответа на свой вопрос?</h3>
              <p className="text-sm text-gray-600 mb-4">
                Свяжитесь с нами, и мы предоставим необходимую информацию.
              </p>
              <Button
                onClick={askQuestionModal.open}
                className="bg-[#18A36C] hover:bg-[#18A36C]/90 text-white"
              >
                <MessageSquare className="w-4 h-4 mr-[2.5px]" />
                Задать вопрос
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Partner Modal */}
      <PartnerModal
        partner={selectedPartner}
        open={isPartnerModalOpen}
        onOpenChange={setIsPartnerModalOpen}
      />

      {/* Vacancy Modal */}
      <VacancyModal
        vacancy={selectedVacancy}
        open={isVacancyModalOpen}
        onOpenChange={setIsVacancyModalOpen}
      />

      {/* Ask Question Modal */}
      <AskQuestionModal
        isOpen={askQuestionModal.isOpen}
        onClose={askQuestionModal.close}
        onComplete={() => {
          // Здесь можно добавить логику для открытия чата или другого действия
        }}
      />
    </>
  );
}