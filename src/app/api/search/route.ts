import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { getServicesMenuFromDB } from "@/lib/getServicesMenu";

interface SearchResult {
  id: string;
  title: string;
  description: string;
  category: string;
  url: string;
  type: "service" | "specialist" | "vacancy" | "faq" | "material" | "partner" | "contact" | "patient-info";
}

interface MenuItem {
  id: string;
  title: string;
  icon?: string;
  description?: string;
  children?: MenuItem[];
}

// Функция для рекурсивного поиска в меню услуг
function searchInServiceMenu(
  items: MenuItem[],
  searchTerm: string,
  categoryPath: string[] = []
): SearchResult[] {
  const results: SearchResult[] = [];
  const lowerSearchTerm = searchTerm.toLowerCase();

  for (const item of items) {
    const titleMatch = item.title.toLowerCase().includes(lowerSearchTerm);
    const descriptionMatch = item.description?.toLowerCase().includes(lowerSearchTerm);

    if (titleMatch || descriptionMatch) {
      // Формируем категорию - используем путь категорий или первый элемент
      const displayCategory = categoryPath.length > 0
        ? categoryPath[0]  // Показываем только корневую категорию
        : 'Услуги';

      results.push({
        id: `service-menu-${item.id}`,
        title: item.title,
        description: item.description || `Раздел услуг: ${item.title}`,
        category: displayCategory,
        url: `/services/${item.id}`,
        type: "service",
      });
    }

    // Рекурсивный поиск в подкатегориях
    if (item.children && item.children.length > 0) {
      // Если путь пустой - начинаем новый путь с текущего элемента
      // Если путь уже есть - продолжаем его
      const newPath = categoryPath.length === 0 ? [item.title] : categoryPath;
      const childResults = searchInServiceMenu(item.children, searchTerm, newPath);
      results.push(...childResults);
    }
  }

  return results;
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get("q");

    // Минимум 3 символа
    if (!query || query.trim().length < 3) {
      return NextResponse.json({ results: [] }, { status: 200 });
    }

    const searchTerm = query.trim();
    const session = await getServerSession(authOptions);
    const isAuthenticated = !!session?.user;

    // Поиск по всем таблицам БД параллельно
    const [services, specialists, vacancies, faqs, materials, partners, contacts] = await Promise.all([
      // 1. Услуги
      prisma.service.findMany({
        where: {
          OR: [
            { title: { contains: searchTerm, mode: "insensitive" } },
            { subtitle: { contains: searchTerm, mode: "insensitive" } },
            { description: { contains: searchTerm, mode: "insensitive" } },
          ],
        },
        include: {
          serviceCategory: true,
        },
        take: 50,
      }),

      // 2. Специалисты
      prisma.specialist.findMany({
        where: {
          OR: [
            { name: { contains: searchTerm, mode: "insensitive" } },
            { specialization: { contains: searchTerm, mode: "insensitive" } },
            { qualification: { contains: searchTerm, mode: "insensitive" } },
          ],
        },
        include: {
          serviceCategory: true,
        },
        take: 50,
      }),

      // 3. Вакансии (клиника)
      prisma.vacancy.findMany({
        where: {
          OR: [
            { name: { contains: searchTerm, mode: "insensitive" } },
            { category: { contains: searchTerm, mode: "insensitive" } },
            { description: { contains: searchTerm, mode: "insensitive" } },
            { requirements: { contains: searchTerm, mode: "insensitive" } },
          ],
        },
        take: 50,
      }),

      // 4. FAQ (клиника)
      prisma.question.findMany({
        where: {
          OR: [
            { question: { contains: searchTerm, mode: "insensitive" } },
            { answer: { contains: searchTerm, mode: "insensitive" } },
          ],
        },
        include: {
          questionCategory: {
            select: {
              slug: true,
              name: true,
            },
          },
        },
        take: 50,
      }),

      // 5. Материалы (только для авторизованных)
      isAuthenticated
        ? prisma.material.findMany({
            where: {
              AND: [
                { is_active: true },
                {
                  OR: [
                    { title: { contains: searchTerm, mode: "insensitive" } },
                    { content: { contains: searchTerm, mode: "insensitive" } },
                  ],
                },
              ],
            },
            take: 50,
          })
        : Promise.resolve([]),

      // 6. Партнёры (клиника)
      prisma.partner.findMany({
        where: {
          OR: [
            { name: { contains: searchTerm, mode: "insensitive" } },
            { description: { contains: searchTerm, mode: "insensitive" } },
          ],
        },
        include: {
          category: true,
        },
        take: 50,
      }),

      // 7. Контакты
      prisma.contacts.findMany({
        where: {
          OR: [
            { address: { contains: searchTerm, mode: "insensitive" } },
            { phone_number: { contains: searchTerm, mode: "insensitive" } },
            { phone_number_sec: { contains: searchTerm, mode: "insensitive" } },
            { email: { contains: searchTerm, mode: "insensitive" } },
          ],
        },
        take: 10,
      }),
    ]);

    const results: SearchResult[] = [];

    // Форматируем услуги
    services.forEach((service) => {
      const categorySlug = service.serviceCategory?.slug || 'services';
      const categoryName = service.serviceCategory?.name || 'Услуги';

      results.push({
        id: `service-${service.id}`,
        title: service.title,
        description: service.description,
        category: categoryName,
        url: `/services/${categorySlug}/${service.id}`,
        type: "service",
      });
    });

    // Форматируем специалистов
    specialists.forEach((specialist) => {
      const categorySlug = specialist.serviceCategory?.slug || 'doctors';
      const categoryName = specialist.serviceCategory?.name || 'Специалисты';

      results.push({
        id: `specialist-${specialist.id}`,
        title: specialist.name,
        description: `${specialist.specialization} • Стаж: ${specialist.experience} лет • ${specialist.qualification}`,
        category: categoryName,
        url: `/doctors/${categorySlug}/${specialist.id}`,
        type: "specialist",
      });
    });

    // Форматируем вакансии
    vacancies.forEach((vacancy) => {
      results.push({
        id: `vacancy-${vacancy.id}`,
        title: vacancy.name,
        description: vacancy.description,
        category: vacancy.category,
        url: `/clinic/vacancies`,
        type: "vacancy",
      });
    });

    // Форматируем FAQ
    faqs.forEach((faq) => {
      // Если есть категория - используем новый формат URL
      const categorySlug = faq.questionCategory?.slug;
      const categoryName = faq.questionCategory?.name || "Общие вопросы";
      const url = categorySlug
        ? `/clinic/questions/${categorySlug}#faq-${faq.id}`
        : `/clinic/questions`;

      results.push({
        id: `faq-${faq.id}`,
        title: faq.question,
        description: faq.answer || "Ответ скоро будет добавлен",
        category: categoryName,
        url: url,
        type: "faq",
      });
    });

    // Форматируем материалы
    materials.forEach((material) => {
      results.push({
        id: `material-${material.id}`,
        title: material.title,
        description: material.content,
        category: `Материалы ${material.year}`,
        url: `/account`,
        type: "material",
      });
    });

    // Форматируем партнёров
    partners.forEach((partner) => {
      results.push({
        id: `partner-${partner.id}`,
        title: partner.name,
        description: partner.description,
        category: partner.category?.name || 'Партнёры',
        url: `/clinic/partners`,
        type: "partner",
      });
    });

    // Форматируем контакты
    contacts.forEach((contact) => {
      results.push({
        id: `contact-${contact.id}`,
        title: "Контакты клиники",
        description: `${contact.address} • Тел: ${contact.phone_number} • Email: ${contact.email}`,
        category: "Контактная информация",
        url: "/contacts",
        type: "contact",
      });
    });

    // Добавляем статические результаты для страницы "Пациенту"
    const patientPageKeywords = [
      {
        keywords: ["запись", "приём", "прием", "записаться", "визит"],
        title: "Запись на приём",
        description: "Узнайте, как записаться на приём к специалисту, что взять с собой и правила посещения клиники",
      },
      {
        keywords: ["подготовка", "анализ", "кровь", "моча", "экг", "узи", "обследование", "сдать"],
        title: "Подготовка к анализам и обследованиям",
        description: "Рекомендации по подготовке к анализам крови, мочи, ЭКГ, УЗИ и другим обследованиям",
      },
      {
        keywords: ["документ", "договор", "согласие", "политика", "конфиденциальность", "защита данных"],
        title: "Документы и согласия",
        description: "Договор оказания услуг, политика конфиденциальности, защита персональных данных и информированное согласие",
      },
      {
        keywords: ["оплата", "цена", "стоимость", "тариф", "страховка", "страхование", "оплатить"],
        title: "Способы оплаты",
        description: "Информация о способах оплаты услуг: наличные, банковские карты, рассрочка и медицинское страхование",
      },
    ];

    patientPageKeywords.forEach((item, index) => {
      const matches = item.keywords.some((keyword) =>
        keyword.includes(searchTerm.toLowerCase()) ||
        searchTerm.toLowerCase().includes(keyword)
      );

      if (matches) {
        results.push({
          id: `patient-info-${index}`,
          title: item.title,
          description: item.description,
          category: "Информация для пациентов",
          url: "/patient",
          type: "patient-info",
        });
      }
    });

    // Поиск по динамическому меню услуг (категории и разделы из БД)
    const servicesMenu = await getServicesMenuFromDB();
    const serviceMenuResults = searchInServiceMenu(servicesMenu, searchTerm);

    // Добавляем результаты поиска по категориям
    // Меню содержит категории и разделы, БД содержит конкретные услуги
    // Это разные типы результатов, поэтому показываем оба
    results.push(...serviceMenuResults);

    return NextResponse.json({ results }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: "Ошибка при поиске", results: [] },
      { status: 500 }
    );
  }
}
