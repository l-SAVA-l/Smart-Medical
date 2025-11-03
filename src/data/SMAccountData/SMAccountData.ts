interface AccountData {
    subscriptions: {
      id: string;
      title: string;
      description: string;
      settings: {
        email: string;
        categories: string[];
        format: 'text' | 'html';
        agreed: boolean;
      };
    };
    materials: {
      id: string;
      title: string;
      description: string;
      items: {
        id: string;
        title: string;
        content: string;
        image: string;
        date: string;
        year: number;
      }[];
    };
    contact: {
      id: string;
      title: string;
      description: string;
      form: {
        name: string;
        subject: string;
        message: string;
      };
    };
  }
  
  export const accountData: AccountData = {
    subscriptions: {
      id: 'subscriptions',
      title: 'Подписки',
      description: 'Настройте ваши подписки на новости и уведомления',
      settings: {
        email: '',
        categories: [],
        format: 'html',
        agreed: false
      }
    },
    materials: {
      id: 'materials',
      title: 'Материалы',
      description: 'Специальные предложения и материалы для подписчиков',
      items: [
        {
          id: 'offer-2025-1',
          title: 'Новогодние скидки на стоматологические услуги',
          content: 'Специальное предложение на все виды стоматологических услуг в январе',
          image: 'https://images.unsplash.com/photo-1606811841689-23dfddce3e95?w=400&h=300&fit=crop',
          date: '15 января 2025',
          year: 2025
        },
        {
          id: 'offer-2025-2',
          title: 'Комплексная диагностика со скидкой 30%',
          content: 'Полное обследование организма по специальной цене',
          image: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?w=400&h=300&fit=crop',
          date: '10 января 2025',
          year: 2025
        },
        {
          id: 'offer-2024-1',
          title: 'Акция на вакцинацию',
          content: 'Скидки на все виды вакцинации для взрослых и детей',
          image: 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=400&h=300&fit=crop',
          date: '20 декабря 2024',
          year: 2024
        },
        {
          id: 'offer-2024-2',
          title: 'Профилактические осмотры',
          content: 'Бесплатные консультации специалистов в рамках профилактики',
          image: 'https://images.unsplash.com/photo-1551076805-e1869033e561?w=400&h=300&fit=crop',
          date: '15 ноября 2024',
          year: 2024
        },
        {
          id: 'offer-2023-1',
          title: 'Летние скидки на косметологию',
          content: 'Специальные цены на косметологические процедуры',
          image: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=400&h=300&fit=crop',
          date: '1 июля 2023',
          year: 2023
        }
      ]
    },
    contact: {
      id: 'contact',
      title: 'Написать глав.врачу',
      description: 'Если у вас возникли вопросы по поводу работы наших сотрудников или компании в целом, а также если вы хотите сказать слова благодарности, напишите сообщение и оно придет директору лично',
      form: {
        name: '',
        subject: '',
        message: ''
      }
    }
  };
  
  export const subscriptionCategories = [
    'Новости клиники',
    'Специальные предложения',
    'Медицинские статьи',
    'Профилактика и здоровье',
    'Детское здоровье',
    'Стоматология',
    'Косметология'
  ];

  interface User {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    middleName: string;
    phone: string;
    login: string;
    isAuthenticated: boolean;
    get name(): string;
  }
  
  export const mockUser: User = {
    id: '1',
    email: 'user@example.com',
    firstName: 'Иван',
    lastName: 'Петров',
    middleName: 'Сергеевич',
    phone: '+375291234567',
    login: 'ivanpetrov',
    isAuthenticated: false,
    get name() {
      return `${this.firstName} ${this.lastName}`;
    }
  };