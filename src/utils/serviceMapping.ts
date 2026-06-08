/**
 * Маппинг между serviceId из меню и названиями услуг в БД
 * Это необходимо для точного сопоставления URL из меню с данными в базе
 */
export const serviceIdToTitleMapping: Record<string, Record<string, string>> = {
  // Стоматология
  'dentistry': {
    'caries-treatment': 'Лечение кариеса',
    'teeth-whitening': 'Отбеливание зубов Beyond Polus',
    'professional-cleaning': 'Профессиональная чистка зубов Air Flow',
    'pulpitis-treatment': 'Лечение пульпита',
    'ultrasonic-cleaning': 'Профессиональная чистка зубов Air Flow',
    'oral-hygiene': 'Профессиональная чистка зубов Air Flow',
  },
  // Детская стоматология
  'pediatric-dentistry': {
    'milk-teeth-treatment': 'Лечение молочных зубов',
    'pediatric-surgeon': 'Детский хирург-стоматолог',
    'pediatric-orthodontist': 'Детский ортодонт',
    'milk-teeth-anesthesia': 'Лечение молочных зубов под наркозом',
  },
  // Гинекология
  'gynecology': {
    'gynecologist-appointment': 'Приём гинеколога',
    'diagnostic-studies': 'Диагностические исследования',
    'intrauterine-device': 'Приём гинеколога', // Fallback
    'cervical-conization': 'Приём гинеколога', // Fallback
    'colposcopy': 'Приём гинеколога', // Fallback
    'tube-patency-check': 'Приём гинеколога', // Fallback
    'polyp-removal': 'Приём гинеколога', // Fallback
    'diagnostic-curettage': 'Приём гинеколога', // Fallback
    'culdocentesis': 'Приём гинеколога', // Fallback
  },
  // УЗИ
  'ultrasound': {
    'pelvic-ultrasound': 'УЗИ органов малого таза',
    'breast-ultrasound': 'УЗИ молочных желез',
    'thyroid-ultrasound': 'УЗИ щитовидной железы',
    'abdominal-ultrasound': 'УЗИ органов брюшной полости',
    'fetal-ultrasound': 'УЗИ плода',
    'gender-party': 'УЗИ плода', // Fallback
  },
  // Кардиология
  'cardiology': {
    'echo-kg': 'ЭХО-КГ (УЗИ сердца)',
    'cardiologist-appointment': 'Приём кардиолога',
    'ecg': 'ЭКГ (электрокардиография)',
    'holter-monitoring': 'Холтеровское мониторирование',
  },
  // Детская гинекология
  'pediatric-gynecology': {
    'pediatric-gynecologist': 'Детский гинеколог',
    'pelvic-ultrasound-girls': 'УЗИ органов малого таза для девочек',
    'adolescent-gynecologist': 'Подростковый гинеколог',
  },
  // Эндокринология
  'endocrinology': {
    'endocrinologist-consultation': 'Консультация врача-эндокринолога',
  },
  // Онкология
  'oncology': {
    'oncologist-appointment': 'Приём врача онколога',
  },
  // Дневной стационар
  'day-hospital': {
    'procedure-room': 'Процедурный кабинет',
  },
  // Диагностика
  'diagnostics': {
    'expert-ultrasound': 'Экспертное УЗИ',
    'analyses': 'Лабораторные анализы',
    'tooth-xray': 'Рентген зубов',
    '3d-dental-scan': '3D сканирование зубов',
    'panoramic-dental-scan': 'Панорамный снимок зубов',
  },
};

/**
 * Получить название услуги по serviceId и categorySlug
 */
export function getServiceTitleByServiceId(
  categorySlug: string,
  serviceId: string
): string | null {
  const categoryMapping = serviceIdToTitleMapping[categorySlug];
  if (!categoryMapping) {
    return null;
  }
  return categoryMapping[serviceId] || null;
}

/**
 * Получить serviceId (slug) по названию услуги и categorySlug
 * Обратный маппинг для поиска
 */
export function getServiceSlugByTitle(
  categorySlug: string,
  serviceTitle: string
): string | null {
  const categoryMapping = serviceIdToTitleMapping[categorySlug];
  if (!categoryMapping) {
    return null;
  }

  // Ищем serviceId по названию
  for (const [serviceId, title] of Object.entries(categoryMapping)) {
    if (title.toLowerCase() === serviceTitle.toLowerCase()) {
      return serviceId;
    }
  }

  return null;
}

/**
 * Получить ключевые слова для поиска услуги по serviceId
 */
export function getServiceKeywords(serviceId: string): string[] {
  const keywordMap: Record<string, string[]> = {
    'breast-ultrasound': ['молочных', 'желез', 'груди', 'молочные', 'грудь'],
    'pelvic-ultrasound': ['малого', 'таза', 'органов', 'малый', 'таз', 'малого таза'],
    'pelvic-ultrasound-girls': ['малого', 'таза', 'органов', 'малый', 'таз', 'малого таза', 'девочек'],
    'thyroid-ultrasound': ['щитовидной', 'железы', 'щитовидная'],
    'caries-treatment': ['кариеса', 'лечение', 'кариес'],
    'teeth-whitening': ['отбеливание', 'зубов', 'белизна'],
    'professional-cleaning': ['чистка', 'зубов', 'профессиональная', 'чистка зубов'],
    'pulpitis-treatment': ['пульпита', 'лечение', 'пульпит'],
    'milk-teeth-treatment': ['молочных', 'зубов', 'лечение', 'молочные зубы'],
    'pediatric-surgeon': ['детский', 'хирург', 'стоматолог', 'удаление'],
    'pediatric-orthodontist': ['детский', 'ортодонт', 'брекеты', 'прикус'],
    'milk-teeth-anesthesia': ['молочных', 'зубов', 'наркоз', 'лечение под наркозом'],
    'gynecologist-appointment': ['гинеколога', 'приём', 'гинеколог'],
    'diagnostic-studies': ['диагностические', 'исследования', 'кольпоскопия', 'биопсия'],
    'abdominal-ultrasound': ['брюшной', 'полости', 'брюшная', 'органов брюшной полости'],
    'fetal-ultrasound': ['плода', 'беременности', 'плод', 'узи плода'],
    'echo-kg': ['эхо', 'кг', 'сердца', 'эхокардиография'],
    'expert-ultrasound': ['экспертное', 'узи', 'экспертный'],
    'analyses': ['лабораторные', 'анализы', 'анализ'],
    'tooth-xray': ['рентген', 'зубов', 'снимок'],
    '3d-dental-scan': ['3d', 'сканирование', 'зубов', 'томография'],
    'panoramic-dental-scan': ['панорамный', 'снимок', 'зубов', 'ортопантомограмма'],
  };
  
  return keywordMap[serviceId] || [];
}

