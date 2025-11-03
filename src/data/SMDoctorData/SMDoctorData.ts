export interface Doctor {
    id: string;
    name: string;
    surname: string;
    position: string;
    category: string;
    qualification: string;
    experience: string;
    photo: string;
    about: {
      specializations: string[];
      education: string[];
      conferences: string[];
      workExamples?: {
        title: string;
        images: string[];
      }[];
    };
    reviews: {
      id: string;
      patientName: string;
      rating: number;
      date: string;
      text: string;
    }[];
  }
  
  export interface DoctorCategory {
    id: string;
    name: string;
    icon: string;
    doctors: Doctor[];
  }
  
  export const doctorCategories: DoctorCategory[] = [
    {
      id: 'pediatric-dentistry',
      name: 'Детская стоматология',
      icon: 'ДС',
      doctors: [
        {
          id: 'ivanova-maria',
          name: 'Мария',
          surname: 'Иванова',
          position: 'Детский стоматолог',
          category: 'pediatric-dentistry',
          qualification: 'Высшая квалификационная категория',
          experience: '12 лет',
          photo: 'https://images.unsplash.com/photo-1706565029539-d09af5896340?w=400&h=400&fit=crop&crop=face',
          about: {
            specializations: [
              'Лечение кариеса у детей',
              'Профилактика стоматологических заболеваний',
              'Детская ортодонтия',
              'Фторирование зубов'
            ],
            education: [
              'Московский государственный медико-стоматологический университет им. А.И. Евдокимова, 2011г.',
              'Интернатура по специальности "Детская стоматология", 2012г.',
              'Курсы повышения квалификации "Современные методы лечения кариеса у детей", 2023г.'
            ],
            conferences: [
              'Международная конференция детских стоматологов, Москва 2023г.',
              'Симпозиум "Профилактика в детской стоматологии", СПб 2022г.',
              'Мастер-класс по седации в детской стоматологии, 2023г.'
            ],
            workExamples: [
              {
                title: 'Лечение множественного кариеса',
                images: [
                  'https://images.unsplash.com/photo-1758205308181-d52b41e00cef?w=600&h=400&fit=crop',
                  'https://images.unsplash.com/photo-1631896333453-866c5603b7c6?w=600&h=400&fit=crop'
                ]
              }
            ]
          },
          reviews: [
            {
              id: '1',
              patientName: 'Анна К.',
              rating: 5,
              date: '2025-01-15',
              text: 'Отличный врач! Дочка больше не боится стоматолога. Мария Петровна очень терпеливая и добрая.'
            },
            {
              id: '2',
              patientName: 'Сергей М.',
              rating: 5,
              date: '2025-01-10',
              text: 'Профессиональный подход к лечению детей. Сын остался доволен приемом.'
            }
          ]
        },
        {
          id: 'petrov-alexey',
          name: 'Алексей',
          surname: 'Петров',
          position: 'Детский стоматолог-ортодонт',
          category: 'pediatric-dentistry',
          qualification: 'Первая квалификационная категория',
          experience: '8 лет',
          photo: 'https://images.unsplash.com/photo-1615177393114-bd2917a4f74a?w=400&h=400&fit=crop&crop=face',
          about: {
            specializations: [
              'Детская ортодонтия',
              'Исправление прикуса',
              'Установка брекет-систем',
              'Миофункциональная терапия'
            ],
            education: [
              'РУДН, стоматологический факультет, 2015г.',
              'Ординатура по детской стоматологии, 2017г.',
              'Сертификат по ортодонтии, 2018г.'
            ],
            conferences: [
              'Конгресс ортодонтов России, 2023г.',
              'Семинар "Современные брекет-системы", 2022г.'
            ]
          },
          reviews: [
            {
              id: '3',
              patientName: 'Елена В.',
              rating: 5,
              date: '2024-01-20',
              text: 'Замечательный ортодонт! Результат лечения превзошел все ожидания.'
            }
          ]
        }
      ]
    },
    {
      id: 'dentistry',
      name: 'Стоматология',
      icon: 'СТ',
      doctors: [
        {
          id: 'sidorova-elena',
          name: 'Елена',
          surname: 'Сидорова',
          position: 'Стоматолог-терапевт',
          category: 'dentistry',
          qualification: 'Высшая квалификационная категория',
          experience: '15 лет',
          photo: 'https://images.unsplash.com/photo-1631596577204-53ad0d6e6978?w=400&h=400&fit=crop&crop=face',
          about: {
            specializations: [
              'Эндодонтическое лечение',
              'Эстетическая реставрация зубов',
              'Лечение кариеса и пульпита',
              'Профессиональная гигиена'
            ],
            education: [
              'Первый МГМУ им. И.М. Сеченова, 2008г.',
              'Интернатура по стоматологии общей практики, 2009г.',
              'Курсы по эндодонтии, 2020г.'
            ],
            conferences: [
              'Международный стоматологический конгресс, 2023г.',
              'Симпозиум по эстетической стоматологии, 2022г.'
            ],
            workExamples: [
              {
                title: 'Эстетическая реставрация фронтальных зубов',
                images: [
                  'https://images.unsplash.com/photo-1631896333453-866c5603b7c6?w=600&h=400&fit=crop',
                  'https://images.unsplash.com/photo-1632833239869-a37e3a5806d2?w=600&h=400&fit=crop'
                ]
              }
            ]
          },
          reviews: [
            {
              id: '4',
              patientName: 'Михаил Р.',
              rating: 5,
              date: '2025-01-18',
              text: 'Профессионально выполненная работа. Зубы как новые!'
            }
          ]
        }
      ]
    },
    {
      id: 'gynecology',
      name: 'Гинекология',
      icon: 'ГН',
      doctors: [
        {
          id: 'kozlova-natalia',
          name: 'Наталья',
          surname: 'Козлова',
          position: 'Врач-гинеколог',
          category: 'gynecology',
          qualification: 'Высшая квалификационная категория',
          experience: '18 лет',
          photo: 'https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=400&h=400&fit=crop&crop=face',
          about: {
            specializations: [
              'Ведение беременности',
              'Планирование семьи',
              'Лечение воспалительных заболеваний',
              'Малоинвазивная хирургия'
            ],
            education: [
              'РГМУ им. Н.И. Пирогова, лечебный факультет, 2005г.',
              'Ординатура по акушерству и гинекологии, 2007г.',
              'Повышение квалификации по эндоскопии, 2022г.'
            ],
            conferences: [
              'Российский национальный конгресс "Человек и лекарство", 2023г.',
              'Международная конференция по репродуктивной медицине, 2022г.'
            ]
          },
          reviews: [
            {
              id: '5',
              patientName: 'Ольга С.',
              rating: 5,
              date: '2025-01-22',
              text: 'Внимательный и деликатный врач. Всегда объясняет все понятно.'
            }
          ]
        }
      ]
    },
    {
      id: 'endocrinology',
      name: 'Эндокринология',
      icon: 'ЭН',
      doctors: [
        {
          id: 'volkov-dmitry',
          name: 'Дмитрий',
          surname: 'Волков',
          position: 'Врач-эндокринолог',
          category: 'endocrinology',
          qualification: 'Первая квалификационная категория',
          experience: '10 лет',
          photo: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=400&h=400&fit=crop&crop=face',
          about: {
            specializations: [
              'Сахарный диабет',
              'Заболевания щитовидной железы',
              'Ожирение и метаболический синдром',
              'Остеопороз'
            ],
            education: [
              'МГМСУ им. А.И. Евдокимова, лечебный факультет, 2013г.',
              'Ординатура по эндокринологии, 2015г.',
              'Курсы по диабетологии, 2021г.'
            ],
            conferences: [
              'Российский национальный эндокринологический конгресс, 2023г.',
              'Международный диабетологический конгресс, 2022г.'
            ]
          },
          reviews: [
            {
              id: '6',
              patientName: 'Александр И.',
              rating: 5,
              date: '2025-01-25',
              text: 'Грамотный специалист. Помог нормализовать уровень сахара.'
            }
          ]
        }
      ]
    },
    {
      id: 'oncology',
      name: 'Онкология',
      icon: 'ОН',
      doctors: [
        {
          id: 'romanova-svetlana',
          name: 'Светлана',
          surname: 'Романова',
          position: 'Врач-онколог',
          category: 'oncology',
          qualification: 'Высшая квалификационная категория',
          experience: '20 лет',
          photo: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400&h=400&fit=crop&crop=face',
          about: {
            specializations: [
              'Диагностика онкологических заболеваний',
              'Химиотерапия',
              'Паллиативная помощь',
              'Профилактика рака'
            ],
            education: [
              'ММА им. И.М. Сеченова, лечебный факультет, 2003г.',
              'Ординатура по онкологии, 2005г.',
              'Повышение квалификации по химиотерапии, 2023г.'
            ],
            conferences: [
              'Российский онкологический конгресс, 2023г.',
              'Международная конференция по паллиативной медицине, 2022г.'
            ]
          },
          reviews: [
            {
              id: '7',
              patientName: 'Мария К.',
              rating: 5,
              date: '2024-01-20',
              text: 'Очень чуткий и профессиональный врач. Поддержала в трудный период.'
            }
          ]
        }
      ]
    },
    {
      id: 'urology',
      name: 'Урология',
      icon: 'УР',
      doctors: [
        {
          id: 'fedorov-ivan',
          name: 'Иван',
          surname: 'Федоров',
          position: 'Врач-уролог',
          category: 'urology',
          qualification: 'Первая квалификационная категория',
          experience: '12 лет',
          photo: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=400&h=400&fit=crop&crop=face',
          about: {
            specializations: [
              'Мочекаменная болезнь',
              'Заболевания простаты',
              'Инфекции мочеполовой системы',
              'Мужское бесплодие'
            ],
            education: [
              'РНИМУ им. Н.И. Пирогова, лечебный факультет, 2011г.',
              'Ординатура по урологии, 2013г.',
              'Курсы по андрологии, 2020г.'
            ],
            conferences: [
              'Российский съезд урологов, 2023г.',
              'Европейская ассоциация урологов, конгресс 2022г.'
            ]
          },
          reviews: [
            {
              id: '8',
              patientName: 'Сергей Н.',
              rating: 5,
              date: '2025-01-19',
              text: 'Деликатный подход, качественное лечение. Рекомендую!'
            }
          ]
        }
      ]
    },
    {
      id: 'anesthesiology',
      name: 'Анестезиология',
      icon: 'АН',
      doctors: [
        {
          id: 'morozova-anna',
          name: 'Анна',
          surname: 'Морозова',
          position: 'Врач-анестезиолог',
          category: 'anesthesiology',
          qualification: 'Высшая квалификационная категория',
          experience: '14 лет',
          photo: 'https://images.unsplash.com/photo-1594824804732-ca8cebc4d53c?w=400&h=400&fit=crop&crop=face',
          about: {
            specializations: [
              'Общая анестезия',
              'Регионарная анестезия',
              'Интенсивная терапия',
              'Реанимация'
            ],
            education: [
              'МГМСУ им. А.И. Евдокимова, лечебный факультет, 2009г.',
              'Ординатура по анестезиологии-реаниматологии, 2011г.',
              'Курсы по интенсивной терапии, 2022г.'
            ],
            conferences: [
              'Российский национальный конгресс анестезиологов-реаниматологов, 2023г.',
              'Международный симпозиум по регионарной анестезии, 2022г.'
            ]
          },
          reviews: [
            {
              id: '9',
              patientName: 'Татьяна Л.',
              rating: 5,
              date: '2025-01-17',
              text: 'Профессиональная работа, никаких осложнений после наркоза.'
            }
          ]
        }
      ]
    },
    {
      id: 'ultrasound',
      name: 'УЗИ',
      icon: 'УЗ',
      doctors: [
        {
          id: 'karpova-olga',
          name: 'Ольга',
          surname: 'Карпова',
          position: 'Врач УЗИ-диагностики',
          category: 'ultrasound',
          qualification: 'Высшая квалификационная категория',
          experience: '16 лет',
          photo: 'https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=400&h=400&fit=crop&crop=face',
          about: {
            specializations: [
              'УЗИ органов брюшной полости',
              'УЗИ сердца (ЭхоКГ)',
              'УЗИ щитовидной железы',
              'УЗИ при беременности'
            ],
            education: [
              'РУДН, медицинский факультет, 2007г.',
              'Интернатура по лучевой диагностике, 2008г.',
              'Специализация по УЗИ-диагностике, 2009г.'
            ],
            conferences: [
              'Российский конгресс лучевых диагностов, 2023г.',
              'Международная конференция по ультразвуковой диагностике, 2022г.'
            ]
          },
          reviews: [
            {
              id: '10',
              patientName: 'Екатерина Р.',
              rating: 5,
              date: '2025-01-21',
              text: 'Внимательная диагностика, подробное объяснение результатов.'
            }
          ]
        }
      ]
    },
    {
      id: 'day-hospital',
      name: 'Дневной стационар',
      icon: 'ДН',
      doctors: [
        {
          id: 'sokolova-marina',
          name: 'Марина',
          surname: 'Соколова',
          position: 'Врач-терапевт дневного стационара',
          category: 'day-hospital',
          qualification: 'Первая квалификационная категория',
          experience: '11 лет',
          photo: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400&h=400&fit=crop&crop=face',
          about: {
            specializations: [
              'Внутривенная терапия',
              'Наблюдение пациентов',
              'Реабилитация',
              'Подготовка к операциям'
            ],
            education: [
              'РГМУ им. Н.И. Пирогова, лечебный факультет, 2012г.',
              'Интернатура по терапии, 2013г.',
              'Курсы по интенсивной терапии, 2021г.'
            ],
            conferences: [
              'Конференция по стационарозамещающим технологиям, 2023г.',
              'Семинар по организации дневных стационаров, 2022г.'
            ]
          },
          reviews: [
            {
              id: '11',
              patientName: 'Владимир С.',
              rating: 5,
              date: '2025-01-23',
              text: 'Отличная организация лечения в дневном стационаре.'
            }
          ]
        }
      ]
    }
  ];
  
  // Helper functions
  export const getDoctorsByCategory = (categoryId: string): Doctor[] => {
    const category = doctorCategories.find(cat => cat.id === categoryId);
    return category ? category.doctors : [];
  };
  
  export const getDoctorById = (doctorId: string): Doctor | undefined => {
    for (const category of doctorCategories) {
      const doctor = category.doctors.find(doc => doc.id === doctorId);
      if (doctor) return doctor;
    }
    return undefined;
  };
  
  export const getCategoryById = (categoryId: string): DoctorCategory | undefined => {
    return doctorCategories.find(cat => cat.id === categoryId);
  };