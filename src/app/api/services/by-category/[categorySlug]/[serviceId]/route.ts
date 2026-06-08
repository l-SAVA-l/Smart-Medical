import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServiceTitleByServiceId, getServiceKeywords } from '@/utils/serviceMapping';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ categorySlug: string; serviceId: string }> }
) {
  try {
    const { categorySlug, serviceId } = await params;

    const serviceCategory = await prisma.serviceCategory.findUnique({
      where: { slug: categorySlug },
    });

    if (!serviceCategory) {
      return NextResponse.json(
        { error: 'Category not found' },
        { status: 404 }
      );
    }

    // Для новой структуры учитываем не только выбранную категорию,
    // но и ее дочерние категории (вплоть до 2 уровней).
    let allowedServiceCategoryIds: number[] = [];
    if (serviceCategory) {
      const children = await prisma.serviceCategory.findMany({
        where: { parent_id: serviceCategory.id, is_active: true },
        select: { id: true },
      });
      const childIds = children.map((c) => c.id);

      let grandChildIds: number[] = [];
      if (childIds.length > 0) {
        const grandChildren = await prisma.serviceCategory.findMany({
          where: {
            parent_id: { in: childIds },
            is_active: true,
          },
          select: { id: true },
        });
        grandChildIds = grandChildren.map((c) => c.id);
      }

      allowedServiceCategoryIds = [serviceCategory.id, ...childIds, ...grandChildIds];
    }

    // Пытаемся определить, является ли serviceId числом (id) или строкой (название)
    const serviceIdNumber = parseInt(serviceId);
    const isNumericId = !isNaN(serviceIdNumber);

    let service;

    if (isNumericId) {
      service = await prisma.service.findFirst({
        where: {
          id: serviceIdNumber,
          service_category_id: { in: allowedServiceCategoryIds },
        },
        include: {
          serviceCategory: true,
          specialists: {
            include: {
              specialist: {
                include: {
                  serviceCategory: true,
                },
              },
            },
          },
          questions: true,
          feedbacks: {
            orderBy: {
              date: 'desc',
            },
          },
        },
      });

      // Transform data
      if (service) {
        service = {
          ...service,
          specialists: service.specialists.map(ss => ss.specialist),
        };
      }
    } else {
      // Если serviceId - строка, сначала пытаемся получить точное название из маппинга
      const serviceTitle = getServiceTitleByServiceId(categorySlug, serviceId);

      const servicesRaw = await prisma.service.findMany({
        where: {
          service_category_id: { in: allowedServiceCategoryIds },
        },
        include: {
          serviceCategory: true,
          specialists: {
            include: {
              specialist: {
                include: {
                  serviceCategory: true,
                },
              },
            },
          },
          questions: true,
          feedbacks: {
            orderBy: {
              date: 'desc',
            },
          },
        },
      });

      // Transform data
      const services = servicesRaw.map(s => ({
        ...s,
        specialists: s.specialists.map(ss => ss.specialist),
      }));

      // Если есть маппинг, ищем по точному названию (это самый надежный способ)
      if (serviceTitle) {
        service = services.find(
          (s: typeof services[0]) => s.title === serviceTitle
        );
        
        // Если найдено через маппинг, сразу возвращаем результат
        if (service) {
          return NextResponse.json(service);
        }
      }

      // Если не найдено через маппинг, пытаемся найти по title или subtitle
      if (!service) {
        // Точное совпадение (без учета регистра)
        service = services.find(
          (s: typeof services[0]) =>
            s.title.toLowerCase() === serviceId.toLowerCase() ||
            s.subtitle.toLowerCase() === serviceId.toLowerCase()
        );
      }

      // Если точного совпадения нет, ищем по ключевым словам
      if (!service) {
        // Получаем ключевые слова для поиска
        const keywords = getServiceKeywords(serviceId);
        const normalizedServiceId = serviceId.toLowerCase().replace(/-/g, ' ').replace(/\s+/g, ' ').trim();
        const serviceIdWords = normalizedServiceId.split(' ').filter(w => w.length > 2); // Игнорируем короткие слова
        
        // Добавляем ключевые слова из маппинга
        const allSearchWords = [...serviceIdWords, ...keywords];
        
        // Ищем услугу по ключевым словам
        let bestMatch: typeof services[0] | null = null;
        let bestMatchScore = 0;
        
        for (const s of services) {
          const normalizedTitle = s.title.toLowerCase().replace(/\s+/g, ' ').trim();
          const normalizedSubtitle = s.subtitle.toLowerCase().replace(/\s+/g, ' ').trim();
          const titleWords = normalizedTitle.split(' ');
          const subtitleWords = normalizedSubtitle.split(' ');
          
          // Подсчитываем количество совпадений слов
          let matchScore = 0;
          
          // Приоритет: ключевые слова из маппинга (они наиболее важны)
          if (keywords.length > 0) {
            const keywordMatches = keywords.filter(keyword =>
              normalizedTitle.includes(keyword) || normalizedSubtitle.includes(keyword)
            ).length;
            // Если все ключевые слова найдены - это очень хорошее совпадение
            if (keywordMatches === keywords.length && keywords.length > 0) {
              matchScore += 50; // Очень большой бонус за полное совпадение всех ключевых слов
            } else {
              matchScore += keywordMatches * 10; // Большой бонус за совпадение ключевых слов
            }
          }
          
          // Проверяем совпадения обычных слов
          for (const word of serviceIdWords) {
            // Проверяем совпадения в title
            if (titleWords.some(tw => tw.includes(word) || word.includes(tw))) {
              matchScore += 3; // Больший вес для совпадений в title
            }
            // Проверяем совпадения в subtitle
            if (subtitleWords.some(sw => sw.includes(word) || word.includes(sw))) {
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
            const conflictingWords: Record<string, string[]> = {
              'breast-ultrasound': ['малого', 'таза', 'щитовидной'],
              'pelvic-ultrasound': ['молочных', 'желез', 'щитовидной'],
              'thyroid-ultrasound': ['молочных', 'желез', 'малого', 'таза'],
            };
            
            const conflicting = conflictingWords[serviceId] || [];
            const hasConflict = conflicting.some(conflictWord =>
              normalizedTitle.includes(conflictWord) || normalizedSubtitle.includes(conflictWord)
            );
            
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
      return NextResponse.json(
        { error: 'Service not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(service);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch service' },
      { status: 500 }
    );
  }
}

