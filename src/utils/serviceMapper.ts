import { ServiceData } from '@/data/SMServicesData/SMServicesData';

export interface ServiceFromDB {
  id: number;
  title: string;
  subtitle: string;
  price: number;
  video_url: string;
  description: string;
  image_url: string;
  image_url_1: string;
  image_url_2: string;
  image_url_3: string;
  image_url_4: string | null;
  questions_id: number;
  reviews_id: number;
  service_category_id: number;
  serviceCategory: {
    id: number;
    name: string;
    slug: string;
  };
  specialists: Array<{
    id: number;
    name: string;
    specialization: string;
    qualification: string;
    experience: number;
    grade: number;
    image_url: string;
    serviceCategory?: {
      id: number;
      name: string;
      slug: string;
    } | null;
  }>;
  questions: Array<{
    id: number;
    question: string;
    answer: string | null;
    service_id: number;
  }>;
  feedbacks: Array<{
    id: number;
    name: string;
    text: string;
    date: Date | string;
    grade: number;
    image_url: string;
    service_id: number;
  }>;
}

export function mapServiceFromDBToServiceData(service: ServiceFromDB): ServiceData {
  // Формируем галерею изображений
  const gallery: string[] = [
    service.image_url_1,
    service.image_url_2,
    service.image_url_3,
  ].filter(Boolean);
  
  if (service.image_url_4) {
    gallery.push(service.image_url_4);
  }

  // Форматируем цену
  const price = `от ${service.price} BYN`;

  // Форматируем FAQ из вопросов
  const faq = service.questions
    .filter(q => q.answer !== null && q.answer.trim() !== '')
    .map(q => ({
      question: q.question,
      answer: q.answer!,
    }));

  // Форматируем отзывы
  const reviews = service.feedbacks.map((feedback) => {
    const date = typeof feedback.date === 'string'
      ? new Date(feedback.date)
      : feedback.date;

    return {
      id: feedback.id.toString(),
      name: feedback.name,
      rating: feedback.grade,
      text: feedback.text,
      image_url: feedback.image_url,
      date: date.toLocaleDateString('ru-RU', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      }),
    };
  });

  // Форматируем врачей (специалистов) - передаем полные данные для использования в SpecialistCard
  const specialists = service.specialists.map(specialist => ({
    id: specialist.id,
    name: specialist.name,
    specialization: specialist.specialization,
    qualification: specialist.qualification,
    experience: specialist.experience,
    grade: specialist.grade,
    image_url: specialist.image_url,
    category: specialist.serviceCategory ?? undefined,
  }));

  return {
    title: service.title,
    category: service.serviceCategory?.name || 'Услуги',
    description: service.subtitle,
    image: service.image_url,
    price,
    videoUrl: service.video_url || undefined,
    breadcrumbs: [
      { label: 'Услуги', path: '/' },
      {
        label: service.serviceCategory?.name || 'Услуги',
        path: `/services/${service.serviceCategory?.slug || 'services'}`,
      },
      { label: service.title },
    ],
    fullDescription: service.description,
    faq: faq.length > 0 ? faq : [
      {
        question: 'Как подготовиться к процедуре?',
        answer: 'Специальной подготовки не требуется. При необходимости врач даст индивидуальные рекомендации.',
      },
      {
        question: 'Сколько времени занимает процедура?',
        answer: 'Время проведения зависит от сложности случая, обычно от 30 до 60 минут.',
      },
      {
        question: 'Есть ли противопоказания?',
        answer: 'Противопоказания определяются индивидуально на консультации с врачом.',
      },
    ],
    gallery: gallery.length > 0 ? gallery : [service.image_url],
    specialists,
    reviews: reviews.length > 0 ? reviews : [
      {
        id: '1',
        name: 'Отзывов пока нет',
        rating: 5,
        text: 'Станьте первым, кто оставит отзыв об этой услуге.',
        date: new Date().toLocaleDateString('ru-RU'),
      },
    ],
  };
}

