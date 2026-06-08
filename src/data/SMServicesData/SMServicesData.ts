export interface ServiceData {
  title: string;
  category: string;
  description: string;
  image: string;
  price?: string;
  videoUrl?: string;
  breadcrumbs: Array<{ label: string; path?: string }>;
  fullDescription: string;
  faq: Array<{ question: string; answer: string }>;
  gallery: string[];
  specialists: Array<{
    id: number;
    name: string;
    specialization: string;
    qualification: string;
    experience: number;
    grade: number;
    image_url: string;
    category?: {
      id: number;
      name: string;
      slug: string;
    };
  }>;
  reviews: Array<{
    id: string;
    name: string;
    rating: number;
    text: string;
    date: string;
    image_url?: string;
  }>;
}

const serviceCategories: Record<string, string> = {
  'pediatric-dentistry': 'Детская стоматология',
  'dentistry': 'Стоматология',
  'gynecology': 'Гинекология',
  'pediatric-gynecology': 'Детская гинекология',
  'pediatric-urology': 'Детская урология',
  'endocrinology': 'Эндокринология',
  'oncology': 'Онкология',
  'ultrasound': 'УЗИ',
  'diagnostics': 'Диагностика',
  'day-hospital': 'Дневной стационар'
};

const serviceTitles: Record<string, string> = {
  'milk-teeth-treatment': 'Лечение молочных зубов',
  'pediatric-surgeon': 'Детский хирург-стоматолог',
  'pediatric-orthodontist': 'Детский ортодонт',
  'milk-teeth-anesthesia': 'Лечение молочных зубов под наркозом',
  'teeth-whitening': 'Отбеливание зубов Beyond Polus',
  'professional-cleaning': 'Профессиональная чистка зубов Air Flow',
  'caries-treatment': 'Лечение кариеса',
  'pulpitis-treatment': 'Лечение пульпита',
  'gynecologist-appointment': 'Приём гинеколога',
  'diagnostic-studies': 'Диагностические исследования',
  'pelvic-ultrasound': 'УЗИ органов малого таза',
  'breast-ultrasound': 'УЗИ молочных желез',
  'thyroid-ultrasound': 'УЗИ щитовидной железы'
};

function getServicePrice(categoryId: string, serviceId: string): string {
  const prices: Record<string, Record<string, string>> = {
    'pediatric-dentistry': {
      'milk-teeth-treatment': 'от 45 BYN',
      'pediatric-surgeon': 'от 80 BYN',
      'pediatric-orthodontist': 'от 60 BYN',
      'milk-teeth-anesthesia': 'от 120 BYN'
    },
    'dentistry': {
      'teeth-whitening': 'от 150 BYN',
      'professional-cleaning': 'от 70 BYN',
      'caries-treatment': 'от 55 BYN',
      'pulpitis-treatment': 'от 90 BYN'
    },
    'gynecology': {
      'gynecologist-appointment': 'от 50 BYN',
      'diagnostic-studies': 'от 65 BYN',
      'pelvic-ultrasound': 'от 45 BYN'
    },
    'pediatric-gynecology': {
      'default': 'от 55 BYN'
    },
    'pediatric-urology': {
      'default': 'от 60 BYN'
    },
    'endocrinology': {
      'default': 'от 50 BYN'
    },
    'oncology': {
      'default': 'от 80 BYN'
    },
    'ultrasound': {
      'breast-ultrasound': 'от 40 BYN',
      'thyroid-ultrasound': 'от 35 BYN',
      'default': 'от 45 BYN'
    },
    'diagnostics': {
      'default': 'от 35 BYN'
    },
    'day-hospital': {
      'default': 'от 100 BYN'
    }
  };
  
  return prices[categoryId]?.[serviceId] || prices[categoryId]?.['default'] || 'от 50 BYN';
}

export function getServiceData(serviceId: string, categoryId: string): ServiceData {
  const category = serviceCategories[categoryId] || 'Услуги';
  const title = serviceTitles[serviceId] || 'Медицинская услуга';
  
  // Base service data
  const baseData: ServiceData = {
    title,
    category,
    description: `Профессиональная медицинская услуга ${title.toLowerCase()} в клинике Doctor Family с использованием современного оборудования и методов.`,
    image: getServiceImage(categoryId, serviceId),
    price: getServicePrice(categoryId, serviceId),
    breadcrumbs: [
      { label: 'Услуги', path: '/' },
      { label: category, path: `/services/${categoryId}` },
      { label: title }
    ],
    fullDescription: getServiceDescription(categoryId, serviceId),
    faq: getServiceFaq(categoryId, serviceId),
    gallery: getServiceGallery(categoryId, serviceId),
    specialists: [], // Fallback данные не должны показывать специалистов, так как привязка идет через БД
    reviews: getServiceReviews(categoryId, serviceId)
  };

  return baseData;
}

function getServiceImage(categoryId: string, serviceId: string): string {
  const images: Record<string, string> = {
    'pediatric-dentistry': 'https://images.unsplash.com/photo-1758205308172-fc864545dcf7?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=800',
    'dentistry': 'https://images.unsplash.com/photo-1642844819197-5f5f21b89ff8?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=800',
    'gynecology': 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=800',
    'ultrasound': 'https://images.unsplash.com/photo-1581595220892-b0739db3ba8c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=800'
  };
  
  return images[categoryId] || images['dentistry'];
}

function getServiceDescription(categoryId: string, serviceId: string): string {
  const descriptions: Record<string, Record<string, string>> = {
    'pediatric-dentistry': {
      'milk-teeth-treatment': `
        Лечение молочных зубов в клинике Doctor Family проводится с особой осторожностью и вниманием к маленьким пациентам. 
        Мы используем современные методы обезболивания и создаем комфортную атмосферу для детей.
        
        Наши детские стоматологи имеют большой опыт работы с детьми разного возраста и знают, как найти подход к каждому ребенку.
        Мы применяем только безопасные материалы и современное оборудование.
      `,
      'pediatric-surgeon': `
        Детская хирургическая стоматология в Doctor Family включает весь спектр оперативных вмешательств для маленьких пациентов.
        Наши специалисты проводят операции с максимальной осторожностью, используя щадящие методики и современное оборудование.
        
        Мы обеспечиваем безболезненное проведение всех процедур и создаем комфортную атмосферу для ребенка и родителей.
      `
    },
    'dentistry': {
      'teeth-whitening': `
        Профессиональное отбеливание зубов Beyond Polus в клинике Doctor Family позволяет достичь заметных результатов уже за одну процедуру.
        Система Beyond Polus использует холодный свет, что исключает перегрев тканей зуба.
        
        Процедура абсолютно безболезненна и безопасна для эмали зубов. Результат сохраняется до 2-3 лет при соблюдении рекомендаций врача.
      `,
      'professional-cleaning': `
        Профессиональная чистка зубов Air Flow - это современная методика удаления зубного налета и пигментации.
        Процедура проводится с помощью специального аппарата, подающего под давлением смесь воды, воздуха и абразивного порошка.
        
        Air Flow эффективно удаляет налет в труднодоступных местах, возвращает зубам естественную белизну и свежесть дыхания.
      `
    }
  };
  
  return descriptions[categoryId]?.[serviceId] || `
    Качественная медицинская услуга в клинике Doctor Family. Наши специалисты используют современные методы 
    диагностики и лечения, обеспечивая высокий уровень медицинской помощи.
    
    Мы применяем индивидуальный подход к каждому пациенту и используем только проверенные, безопасные методики.
  `;
}

function getServiceFaq(categoryId: string, serviceId: string) {
  const faqs: Record<string, Record<string, Array<{ question: string; answer: string }>>> = {
    'pediatric-dentistry': {
      'milk-teeth-treatment': [
        {
          question: 'Больно ли лечить молочные зубы?',
          answer: 'Нет, современные методы анестезии позволяют проводить лечение абсолютно безболезненно. Мы используем специальные детские анестетики и техники отвлечения внимания.'
        },
        {
          question: 'Нужно ли лечить молочные зубы, если они всё равно выпадут?',
          answer: 'Да, обязательно. Больные молочные зубы могут повредить зачатки постоянных зубов и вызвать серьёзные проблемы с прикусом в будущем.'
        },
        {
          question: 'С какого возраста можно лечить зубы ребенку?',
          answer: 'Лечение возможно с момента прорезывания первых зубов. Наши врачи работают с детьми от 1 года.'
        }
      ]
    }
  };
  
  return faqs[categoryId]?.[serviceId] || [
    {
      question: 'Как подготовиться к процедуре?',
      answer: 'Специальной подготовки не требуется. При необходимости врач даст индивидуальные рекомендации.'
    },
    {
      question: 'Сколько времени занимает процедура?',
      answer: 'Время проведения зависит от сложности случая, обычно от 30 до 60 минут.'
    },
    {
      question: 'Есть ли противопоказания?',
      answer: 'Противопоказания определяются индивидуально на консультации с врачом.'
    }
  ];
}

function getServiceGallery(categoryId: string, serviceId: string): string[] {
  const galleries: Record<string, string[]> = {
    'pediatric-dentistry': [
      'https://images.unsplash.com/photo-1642844819197-5f5f21b89ff8?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400',
      'https://images.unsplash.com/photo-1683520701490-7172fa20c8f1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400',
      'https://images.unsplash.com/photo-1758205308106-5760d0227cc7?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400',
      'https://images.unsplash.com/photo-1758205308172-fc864545dcf7?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400',
      'https://images.unsplash.com/photo-1642844819197-5f5f21b89ff8?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400',
      'https://images.unsplash.com/photo-1758205308172-fc864545dcf7?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400'
    ],
    'dentistry': [
      'https://images.unsplash.com/photo-1642844819197-5f5f21b89ff8?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400',
      'https://images.unsplash.com/photo-1558618047-a9cd48c043c9?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400',
      'https://images.unsplash.com/photo-1606811841689-23dfddce3e95?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400'
    ]
  };
  
  return galleries[categoryId] || galleries['dentistry'];
}

function getServiceSpecialists(categoryId: string, serviceId: string) {
  const specialists: Record<string, Array<any>> = {
    'pediatric-dentistry': [
      {
        id: 1,
        name: 'Анна Петрова',
        specialization: 'Детский стоматолог',
        qualification: 'Врач высшей категории',
        experience: 8,
        grade: 5,
        image_url: 'https://images.unsplash.com/photo-1685022036259-04cf91a89af1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=200'
      },
      {
        id: 2,
        name: 'Михаил Козлов',
        specialization: 'Детский хирург-стоматолог',
        qualification: 'Врач высшей категории',
        experience: 12,
        grade: 5,
        image_url: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=200'
      },
      {
        id: 3,
        name: 'Екатерина Смирнова',
        specialization: 'Детский ортодонт',
        qualification: 'Врач первой категории',
        experience: 6,
        grade: 5,
        image_url: 'https://images.unsplash.com/photo-1685022036259-04cf91a89af1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=200'
      }
    ],
    'dentistry': [
      {
        id: 4,
        name: 'Дмитрий Волков',
        specialization: 'Стоматолог-терапевт',
        qualification: 'Врач высшей категории',
        experience: 10,
        grade: 5,
        image_url: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=200'
      },
      {
        id: 5,
        name: 'Ольга Морозова',
        specialization: 'Стоматолог-хирург',
        qualification: 'Врач высшей категории',
        experience: 15,
        grade: 5,
        image_url: 'https://images.unsplash.com/photo-1685022036259-04cf91a89af1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=200'
      }
    ]
  };

  return specialists[categoryId] || specialists['dentistry'];
}

function getServiceReviews(categoryId: string, serviceId: string) {
  const reviews = [
    {
      id: '1',
      name: 'Мария Иванова',
      rating: 5,
      text: 'Отличное качество услуг! Врач профессионал, все прошло быстро и безболезненно. Очень довольна результатом.',
      date: '15.01.2025'
    },
    {
      id: '2',
      name: 'Алексей Петров',
      rating: 5, 
      text: 'Современное оборудование, профессиональный подход. Рекомендую всем знакомым.',
      date: '12.01.2025'
    },
    {
      id: '3',
      name: 'Елена Козлова',
      rating: 5,
      text: 'Прекрасная клиника! Внимательный персонал, комфортная атмосфера. Обязательно приду еще.',
      date: '10.01.2025'
    }
  ];
  
  return reviews;
}