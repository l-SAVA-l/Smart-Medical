module.exports = [
"[externals]/next/dist/compiled/next-server/app-route-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-route-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-route-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-route-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[externals]/next/dist/compiled/@opentelemetry/api [external] (next/dist/compiled/@opentelemetry/api, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/@opentelemetry/api", () => require("next/dist/compiled/@opentelemetry/api"));

module.exports = mod;
}),
"[externals]/next/dist/compiled/next-server/app-page-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-page-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-unit-async-storage.external.js [external] (next/dist/server/app-render/work-unit-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/work-unit-async-storage.external.js", () => require("next/dist/server/app-render/work-unit-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-async-storage.external.js [external] (next/dist/server/app-render/work-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/work-async-storage.external.js", () => require("next/dist/server/app-render/work-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/shared/lib/no-fallback-error.external.js [external] (next/dist/shared/lib/no-fallback-error.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/shared/lib/no-fallback-error.external.js", () => require("next/dist/shared/lib/no-fallback-error.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/after-task-async-storage.external.js [external] (next/dist/server/app-render/after-task-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/after-task-async-storage.external.js", () => require("next/dist/server/app-render/after-task-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/@prisma/client [external] (@prisma/client, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("@prisma/client", () => require("@prisma/client"));

module.exports = mod;
}),
"[project]/src/lib/prisma.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "prisma",
    ()=>prisma
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f40$prisma$2f$client__$5b$external$5d$__$2840$prisma$2f$client$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/@prisma/client [external] (@prisma/client, cjs)");
;
const globalForPrisma = globalThis;
const prisma = globalForPrisma.prisma ?? new __TURBOPACK__imported__module__$5b$externals$5d2f40$prisma$2f$client__$5b$external$5d$__$2840$prisma$2f$client$2c$__cjs$29$__["PrismaClient"]({
    log: ("TURBOPACK compile-time truthy", 1) ? [
        'query',
        'error',
        'warn'
    ] : "TURBOPACK unreachable"
});
if ("TURBOPACK compile-time truthy", 1) globalForPrisma.prisma = prisma;
}),
"[project]/src/utils/serviceMapping.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * Маппинг между serviceId из меню и названиями услуг в БД
 * Это необходимо для точного сопоставления URL из меню с данными в базе
 */ __turbopack_context__.s([
    "getServiceKeywords",
    ()=>getServiceKeywords,
    "getServiceSlugByTitle",
    ()=>getServiceSlugByTitle,
    "getServiceTitleByServiceId",
    ()=>getServiceTitleByServiceId,
    "serviceIdToTitleMapping",
    ()=>serviceIdToTitleMapping
]);
const serviceIdToTitleMapping = {
    // Стоматология
    'dentistry': {
        'caries-treatment': 'Лечение кариеса',
        'teeth-whitening': 'Отбеливание зубов Beyond Polus',
        'professional-cleaning': 'Профессиональная чистка зубов Air Flow',
        'pulpitis-treatment': 'Лечение пульпита',
        'ultrasonic-cleaning': 'Профессиональная чистка зубов Air Flow',
        'oral-hygiene': 'Профессиональная чистка зубов Air Flow'
    },
    // Детская стоматология
    'pediatric-dentistry': {
        'milk-teeth-treatment': 'Лечение молочных зубов',
        'pediatric-surgeon': 'Детский хирург-стоматолог',
        'pediatric-orthodontist': 'Детский ортодонт',
        'milk-teeth-anesthesia': 'Лечение молочных зубов под наркозом'
    },
    // Гинекология
    'gynecology': {
        'gynecologist-appointment': 'Приём гинеколога',
        'diagnostic-studies': 'Диагностические исследования',
        'intrauterine-device': 'Приём гинеколога',
        'cervical-conization': 'Приём гинеколога',
        'colposcopy': 'Приём гинеколога',
        'tube-patency-check': 'Приём гинеколога',
        'polyp-removal': 'Приём гинеколога',
        'diagnostic-curettage': 'Приём гинеколога',
        'culdocentesis': 'Приём гинеколога'
    },
    // УЗИ
    'ultrasound': {
        'pelvic-ultrasound': 'УЗИ органов малого таза',
        'breast-ultrasound': 'УЗИ молочных желез',
        'thyroid-ultrasound': 'УЗИ щитовидной железы',
        'abdominal-ultrasound': 'УЗИ органов брюшной полости',
        'fetal-ultrasound': 'УЗИ плода',
        'gender-party': 'УЗИ плода'
    },
    // Кардиология
    'cardiology': {
        'echo-kg': 'ЭХО-КГ (УЗИ сердца)',
        'cardiologist-appointment': 'Приём кардиолога',
        'ecg': 'ЭКГ (электрокардиография)',
        'holter-monitoring': 'Холтеровское мониторирование'
    },
    // Детская гинекология
    'pediatric-gynecology': {
        'pediatric-gynecologist': 'Детский гинеколог',
        'pelvic-ultrasound-girls': 'УЗИ органов малого таза для девочек',
        'adolescent-gynecologist': 'Подростковый гинеколог'
    },
    // Эндокринология
    'endocrinology': {
        'endocrinologist-consultation': 'Консультация врача-эндокринолога'
    },
    // Онкология
    'oncology': {
        'oncologist-appointment': 'Приём врача онколога'
    },
    // Дневной стационар
    'day-hospital': {
        'procedure-room': 'Процедурный кабинет'
    },
    // Диагностика
    'diagnostics': {
        'expert-ultrasound': 'Экспертное УЗИ',
        'analyses': 'Лабораторные анализы',
        'tooth-xray': 'Рентген зубов',
        '3d-dental-scan': '3D сканирование зубов',
        'panoramic-dental-scan': 'Панорамный снимок зубов'
    }
};
function getServiceTitleByServiceId(categorySlug, serviceId) {
    const categoryMapping = serviceIdToTitleMapping[categorySlug];
    if (!categoryMapping) {
        return null;
    }
    return categoryMapping[serviceId] || null;
}
function getServiceSlugByTitle(categorySlug, serviceTitle) {
    const categoryMapping = serviceIdToTitleMapping[categorySlug];
    if (!categoryMapping) {
        return null;
    }
    // Ищем serviceId по названию
    for (const [serviceId, title] of Object.entries(categoryMapping)){
        if (title.toLowerCase() === serviceTitle.toLowerCase()) {
            return serviceId;
        }
    }
    return null;
}
function getServiceKeywords(serviceId) {
    const keywordMap = {
        'breast-ultrasound': [
            'молочных',
            'желез',
            'груди',
            'молочные',
            'грудь'
        ],
        'pelvic-ultrasound': [
            'малого',
            'таза',
            'органов',
            'малый',
            'таз',
            'малого таза'
        ],
        'pelvic-ultrasound-girls': [
            'малого',
            'таза',
            'органов',
            'малый',
            'таз',
            'малого таза',
            'девочек'
        ],
        'thyroid-ultrasound': [
            'щитовидной',
            'железы',
            'щитовидная'
        ],
        'caries-treatment': [
            'кариеса',
            'лечение',
            'кариес'
        ],
        'teeth-whitening': [
            'отбеливание',
            'зубов',
            'белизна'
        ],
        'professional-cleaning': [
            'чистка',
            'зубов',
            'профессиональная',
            'чистка зубов'
        ],
        'pulpitis-treatment': [
            'пульпита',
            'лечение',
            'пульпит'
        ],
        'milk-teeth-treatment': [
            'молочных',
            'зубов',
            'лечение',
            'молочные зубы'
        ],
        'pediatric-surgeon': [
            'детский',
            'хирург',
            'стоматолог',
            'удаление'
        ],
        'pediatric-orthodontist': [
            'детский',
            'ортодонт',
            'брекеты',
            'прикус'
        ],
        'milk-teeth-anesthesia': [
            'молочных',
            'зубов',
            'наркоз',
            'лечение под наркозом'
        ],
        'gynecologist-appointment': [
            'гинеколога',
            'приём',
            'гинеколог'
        ],
        'diagnostic-studies': [
            'диагностические',
            'исследования',
            'кольпоскопия',
            'биопсия'
        ],
        'abdominal-ultrasound': [
            'брюшной',
            'полости',
            'брюшная',
            'органов брюшной полости'
        ],
        'fetal-ultrasound': [
            'плода',
            'беременности',
            'плод',
            'узи плода'
        ],
        'echo-kg': [
            'эхо',
            'кг',
            'сердца',
            'эхокардиография'
        ],
        'expert-ultrasound': [
            'экспертное',
            'узи',
            'экспертный'
        ],
        'analyses': [
            'лабораторные',
            'анализы',
            'анализ'
        ],
        'tooth-xray': [
            'рентген',
            'зубов',
            'снимок'
        ],
        '3d-dental-scan': [
            '3d',
            'сканирование',
            'зубов',
            'томография'
        ],
        'panoramic-dental-scan': [
            'панорамный',
            'снимок',
            'зубов',
            'ортопантомограмма'
        ]
    };
    return keywordMap[serviceId] || [];
}
}),
"[project]/src/app/api/services/by-category/[categorySlug]/[serviceId]/route.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "GET",
    ()=>GET
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/server.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/prisma.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$utils$2f$serviceMapping$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/utils/serviceMapping.ts [app-route] (ecmascript)");
;
;
;
async function GET(request, { params }) {
    try {
        const { categorySlug, serviceId } = await params;
        const serviceCategory = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].serviceCategory.findUnique({
            where: {
                slug: categorySlug
            }
        });
        if (!serviceCategory) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: 'Category not found'
            }, {
                status: 404
            });
        }
        // Для новой структуры учитываем не только выбранную категорию,
        // но и ее дочерние категории (вплоть до 2 уровней).
        let allowedServiceCategoryIds = [];
        if (serviceCategory) {
            const children = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].serviceCategory.findMany({
                where: {
                    parent_id: serviceCategory.id,
                    is_active: true
                },
                select: {
                    id: true
                }
            });
            const childIds = children.map((c)=>c.id);
            let grandChildIds = [];
            if (childIds.length > 0) {
                const grandChildren = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].serviceCategory.findMany({
                    where: {
                        parent_id: {
                            in: childIds
                        },
                        is_active: true
                    },
                    select: {
                        id: true
                    }
                });
                grandChildIds = grandChildren.map((c)=>c.id);
            }
            allowedServiceCategoryIds = [
                serviceCategory.id,
                ...childIds,
                ...grandChildIds
            ];
        }
        // Пытаемся определить, является ли serviceId числом (id) или строкой (название)
        const serviceIdNumber = parseInt(serviceId);
        const isNumericId = !isNaN(serviceIdNumber);
        let service;
        if (isNumericId) {
            service = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].service.findFirst({
                where: {
                    id: serviceIdNumber,
                    service_category_id: {
                        in: allowedServiceCategoryIds
                    }
                },
                include: {
                    serviceCategory: true,
                    specialists: {
                        include: {
                            specialist: {
                                include: {
                                    serviceCategory: true
                                }
                            }
                        }
                    },
                    questions: true,
                    feedbacks: {
                        orderBy: {
                            date: 'desc'
                        }
                    }
                }
            });
            // Transform data
            if (service) {
                service = {
                    ...service,
                    specialists: service.specialists.map((ss)=>ss.specialist)
                };
            }
        } else {
            // Если serviceId - строка, сначала пытаемся получить точное название из маппинга
            const serviceTitle = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$utils$2f$serviceMapping$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getServiceTitleByServiceId"])(categorySlug, serviceId);
            const servicesRaw = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].service.findMany({
                where: {
                    service_category_id: {
                        in: allowedServiceCategoryIds
                    }
                },
                include: {
                    serviceCategory: true,
                    specialists: {
                        include: {
                            specialist: {
                                include: {
                                    serviceCategory: true
                                }
                            }
                        }
                    },
                    questions: true,
                    feedbacks: {
                        orderBy: {
                            date: 'desc'
                        }
                    }
                }
            });
            // Transform data
            const services = servicesRaw.map((s)=>({
                    ...s,
                    specialists: s.specialists.map((ss)=>ss.specialist)
                }));
            // Если есть маппинг, ищем по точному названию (это самый надежный способ)
            if (serviceTitle) {
                service = services.find((s)=>s.title === serviceTitle);
                // Если найдено через маппинг, сразу возвращаем результат
                if (service) {
                    return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json(service);
                }
            }
            // Если не найдено через маппинг, пытаемся найти по title или subtitle
            if (!service) {
                // Точное совпадение (без учета регистра)
                service = services.find((s)=>s.title.toLowerCase() === serviceId.toLowerCase() || s.subtitle.toLowerCase() === serviceId.toLowerCase());
            }
            // Если точного совпадения нет, ищем по ключевым словам
            if (!service) {
                // Получаем ключевые слова для поиска
                const keywords = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$utils$2f$serviceMapping$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getServiceKeywords"])(serviceId);
                const normalizedServiceId = serviceId.toLowerCase().replace(/-/g, ' ').replace(/\s+/g, ' ').trim();
                const serviceIdWords = normalizedServiceId.split(' ').filter((w)=>w.length > 2); // Игнорируем короткие слова
                // Добавляем ключевые слова из маппинга
                const allSearchWords = [
                    ...serviceIdWords,
                    ...keywords
                ];
                // Ищем услугу по ключевым словам
                let bestMatch = null;
                let bestMatchScore = 0;
                for (const s of services){
                    const normalizedTitle = s.title.toLowerCase().replace(/\s+/g, ' ').trim();
                    const normalizedSubtitle = s.subtitle.toLowerCase().replace(/\s+/g, ' ').trim();
                    const titleWords = normalizedTitle.split(' ');
                    const subtitleWords = normalizedSubtitle.split(' ');
                    // Подсчитываем количество совпадений слов
                    let matchScore = 0;
                    // Приоритет: ключевые слова из маппинга (они наиболее важны)
                    if (keywords.length > 0) {
                        const keywordMatches = keywords.filter((keyword)=>normalizedTitle.includes(keyword) || normalizedSubtitle.includes(keyword)).length;
                        // Если все ключевые слова найдены - это очень хорошее совпадение
                        if (keywordMatches === keywords.length && keywords.length > 0) {
                            matchScore += 50; // Очень большой бонус за полное совпадение всех ключевых слов
                        } else {
                            matchScore += keywordMatches * 10; // Большой бонус за совпадение ключевых слов
                        }
                    }
                    // Проверяем совпадения обычных слов
                    for (const word of serviceIdWords){
                        // Проверяем совпадения в title
                        if (titleWords.some((tw)=>tw.includes(word) || word.includes(tw))) {
                            matchScore += 3; // Больший вес для совпадений в title
                        }
                        // Проверяем совпадения в subtitle
                        if (subtitleWords.some((sw)=>sw.includes(word) || word.includes(sw))) {
                            matchScore += 1; // Меньший вес для совпадений в subtitle
                        }
                    }
                    // Также проверяем полное вхождение
                    if (normalizedTitle.includes(normalizedServiceId) || normalizedServiceId.includes(normalizedTitle)) {
                        matchScore += 10; // Большой бонус за полное совпадение
                    }
                    // Штраф за несовпадение ключевых слов (чтобы избежать неправильных совпадений)
                    if (keywords.length > 0) {
                        // Проверяем, нет ли в названии слов, которые противоречат ключевым словам
                        const conflictingWords = {
                            'breast-ultrasound': [
                                'малого',
                                'таза',
                                'щитовидной'
                            ],
                            'pelvic-ultrasound': [
                                'молочных',
                                'желез',
                                'щитовидной'
                            ],
                            'thyroid-ultrasound': [
                                'молочных',
                                'желез',
                                'малого',
                                'таза'
                            ]
                        };
                        const conflicting = conflictingWords[serviceId] || [];
                        const hasConflict = conflicting.some((conflictWord)=>normalizedTitle.includes(conflictWord) || normalizedSubtitle.includes(conflictWord));
                        if (hasConflict) {
                            matchScore -= 20; // Большой штраф за противоречивые слова
                        }
                    }
                    if (matchScore > bestMatchScore) {
                        bestMatchScore = matchScore;
                        bestMatch = s;
                    }
                }
                // Если найдено хорошее совпадение (минимум 5 очков для более точного поиска), используем его
                // Это гарантирует, что мы не вернем неправильную услугу
                if (bestMatch && bestMatchScore >= 5) {
                    service = bestMatch;
                }
            }
        // Если все еще не найдено, НЕ возвращаем первую услугу - возвращаем 404
        // Это предотвращает показ неправильной услуги
        }
        if (!service) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: 'Service not found'
            }, {
                status: 404
            });
        }
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json(service);
    } catch (error) {
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            error: 'Failed to fetch service'
        }, {
            status: 500
        });
    }
}
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__f21bea51._.js.map