// Конфигурация для автоматической генерации breadcrumbs из URL
export const breadcrumbLabels: Record<string, string> = {
  // Основные разделы
  'services': 'Услуги',
  'doctors': 'Врачи',
  'clinic': 'Клиника',
  'contacts': 'Контакты',
  'patient': 'Пациенту',
  'account': 'Личный кабинет',
  'admin': 'Админ-панель',

  // Услуги и Врачи - категории (используются в URL как /services/dentistry или /doctors/dentistry)
  'dentistry': 'Стоматология',
  'pediatric-dentistry': 'Детская стоматология',
  'gynecology': 'Гинекология',
  'pediatric-gynecology': 'Детская гинекология',
  'pediatric-urology': 'Детская урология',
  'ultrasound': 'УЗИ',
  'diagnostics': 'Диагностика',
  'cardiology': 'Кардиология',
  'endocrinology': 'Эндокринология',
  'oncology': 'Онкология',
  'day-hospital': 'Дневной стационар',

  // Подразделы услуг (второй уровень в меню)
  'therapeutic-dentistry': 'Терапевтическая стоматология',
  'implantation': 'Имплантация',
  'orthopedics': 'Ортопедия',
  'orthodontics': 'Ортодонтия',
  'surgery': 'Хирургия',

  // Клиника - разделы
  'licenses': 'Лицензии',
  'partners': 'Партнёры',
  'reviews': 'Отзывы',
  'requisites': 'Реквизиты',
  'faq': 'Вопрос-ответ',
  'vacancies': 'Вакансии',

  // Партнеры (используются как /clinic/partners/medical-labs)
  'medical-labs': 'Медицинские лаборатории',
  'insurance': 'Страховые компании',
  'dental-labs': 'Зуботехнические лаборатории',

  // FAQ темы
  'children-teeth': 'Детские зубы',
  'girls-hygiene': 'Гигиена девочек',
  'boys-hygiene': 'Гигиена мальчиков',
  'girls-puberty': 'Половое созревание девочек',
  'culdocentesis': 'Кульдоцентез',
  'stomatology': 'Стоматология',
  'polyp-removal': 'Удаления полипов | Полипэктомия',
  'womens-health': 'Женское здоровье',
  'curettage': 'Раздельное диагностическое выскабливание',

  // Админка (используются как /admin/specialists, /admin/feedbacks, etc.)
  'specialists': 'Специалисты',
  'materials': 'Материалы',
  'letters': 'Письма',
  'questions': 'Вопросы (FAQ)',
  'users': 'Пользователи',
};

/**
 * Делает первую букву строки заглавной
 */
function capitalizeFirstLetter(str: string): string {
  if (!str) return str;
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export function generateBreadcrumbsFromUrl(pathname: string): Array<{ label: string; href: string }> {
  // Убираем начальный и конечный слеш, разбиваем на части
  const parts = pathname.replace(/^\/+|\/+$/g, '').split('/').filter(Boolean);

  if (parts.length === 0) {
    return [];
  }

  const breadcrumbs: Array<{ label: string; href: string }> = [];
  let currentPath = '';

  parts.forEach((part, index) => {
    currentPath += `/${part}`;

    // Получаем название из конфига - показываем только если есть русское название
    const label = breadcrumbLabels[part];

    if (label) {
      // Используем русское название с заглавной буквы
      breadcrumbs.push({
        label: capitalizeFirstLetter(label),
        href: currentPath,
      });
    }
    // Если нет русского названия - пропускаем этот элемент
  });

  return breadcrumbs;
}
