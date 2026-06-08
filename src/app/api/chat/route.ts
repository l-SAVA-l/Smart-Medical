import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";

async function parseCardsInMessage(message: string) {

  // Ищем маркеры с учетом возможных пробелов и переносов строк
  const cardRegex = /\[CARD:(SPECIALIST|SERVICE):(\d+)\]/gi;
  const cards: any[] = [];
  let match;

  while ((match = cardRegex.exec(message)) !== null) {
    const [fullMatch, type, id] = match;
    const cardId = parseInt(id);

    try {
      if (type === "SPECIALIST") {
        const specialist = await prisma.specialist.findUnique({
          where: { id: cardId },
          select: {
            id: true,
            name: true,
            qualification: true,
            experience: true,
            specialization: true,
            image_url: true,
            education: true,
            serviceCategory: {
              select: {
                slug: true,
              },
            },
          },
        });

        if (specialist) {
          cards.push({
            type: "specialist",
            data: {
              ...specialist,
              categorySlug: specialist.serviceCategory?.slug || "specialists",
            },
            placeholder: fullMatch,
          });
        } else {
        }
      } else if (type === "SERVICE") {
        const service = await prisma.service.findUnique({
          where: { id: cardId },
          select: {
            id: true,
            title: true,
            description: true,
            serviceCategory: {
              select: {
                name: true,
                slug: true,
              },
            },
            price: true,
          },
        });

        if (service) {
          // Нормализуем данные: category из объекта в строку + добавляем slug
          const normalizedService = {
            ...service,
            category: service.serviceCategory?.name || "Не указано",
            categorySlug: service.serviceCategory?.slug || "services",
          };
          cards.push({
            type: "service",
            data: normalizedService,
            placeholder: fullMatch,
          });
        } else {
        }
      }
    } catch (error) {
    }
  }

  return { message, cards };
}

async function getClinicContext() {
  try {
    const contacts = await prisma.contacts.findFirst();

    const services = await prisma.service.findMany({
      select: {
        id: true,
        title: true,
        description: true,
        serviceCategory: {
          select: {
            name: true,
          },
        },
      },
    });

    const specialists = await prisma.specialist.findMany({
      select: {
        id: true,
        name: true,
        qualification: true,
        experience: true,
        specialization: true,
      },
    });

    // Нормализуем данные: преобразуем вложенные объекты в строки
    const normalizedServices = services.map((s) => ({
      ...s,
      category: s.serviceCategory?.name || "Не указано",
    }));

    return {
      contacts,
      services: normalizedServices,
      specialists,
    };
  } catch (error) {
    if (error instanceof Error) {
    }
    return null;
  }
}

function buildSystemPrompt(clinicData: any) {
  const servicesText = clinicData.services && clinicData.services.length > 0
    ? clinicData.services.map((s: any) => `- ID:${s.id} - ${s.title}: ${s.description || ''}`).join("\n")
    : "Полный список услуг можно уточнить по телефону или на нашем сайте.";

  const specialistsText = clinicData.specialists && clinicData.specialists.length > 0
    ? clinicData.specialists.map((s: any) => `- ID:${s.id} - ${s.name}, ${s.qualification}, ${s.specialization}, опыт: ${s.experience} лет`).join("\n")
    : "Список специалистов можно уточнить по телефону или на нашем сайте.";

  return `Ты - виртуальный помощник медицинской клиники "Doctor Family". Твоя задача - помогать пациентам с информацией о клинике, услугах и специалистах.

📋 КОГДА ОТВЕЧАТЬ ТЕКСТОМ (без карточек):
- Вопросы о контактах, адресе, телефоне
- Вопросы о режиме работы
- Вопросы о записи на приём (как записаться)
- Общие вопросы о клинике
- Вопросы для пациентов (что взять с собой, как подготовиться)

🎴 КОГДА ИСПОЛЬЗОВАТЬ КАРТОЧКИ:
Только когда пользователь просит показать КОНКРЕТНОГО специалиста или услугу!

Формат карточек:
[CARD:SPECIALIST:ID] - заменяй ID на число из списка специалистов
[CARD:SERVICE:ID] - заменяй ID на число из списка услуг

⚠️ КАК НАЙТИ ПРАВИЛЬНЫЙ ID:
В разделе "Наши специалисты" каждая строка начинается с "- ID:число"
В разделе "Наши услуги" каждая строка начинается с "- ID:число"
Возьми это ЧИСЛО и подставь в карточку.

ПРИМЕРЫ (смотри реальные ID в списках ниже!):
- Если пользователь спросит про Анну, найди в списке "Петрова Анна Сергеевна" с её ID и напиши [CARD:SPECIALIST:её_id]
- Если спросят про лечение кариеса, найди в списке услуг "Лечение кариеса" и её ID

❌ НЕПРАВИЛЬНО: [CARD:SPECIALIST:1] или [CARD:SPECIALIST:5] - таких ID нет!
✅ ПРАВИЛЬНО: смотри список ниже, бери реальный ID оттуда

Примеры БЕЗ карточек (отвечай текстом):
Пользователь: "Как записаться на приём?"
Ответ: "Записаться можно несколькими способами:
📞 По телефону: [номер]
🌐 Через сайт
📍 Лично по адресу: [адрес]"

Пользователь: "Какой у вас адрес?"
Ответ: "Мы находимся по адресу: [адрес]. Работаем [часы работы]."

Пользователь: "Что взять с собой на приём?"
Ответ: "На приём рекомендуем взять: паспорт, результаты предыдущих обследований (если есть), список принимаемых лекарств."

ВАЖНЫЕ ПРАВИЛА:
1. Отвечай на вопросы о клинике, услугах, специалистах, контактах, записи на приём
2. НЕ рассказывай про админ-панель или внутренние системы
3. Будь вежливым, дружелюбным и профессиональным
4. Отвечай на русском языке
5. Если не знаешь ответа - предложи позвонить в клинику

🚨 КРИТИЧЕСКИ ВАЖНО - МЕДИЦИНСКАЯ БЕЗОПАСНОСТЬ:

КАТЕГОРИЧЕСКИ ЗАПРЕЩЕНО:
❌ Ставить диагнозы, даже предположительные
❌ Давать советы по лечению или приему лекарств
❌ Интерпретировать симптомы или анализы
❌ Рекомендовать дозировки или изменения в лечении
❌ Давать советы по самолечению
❌ Отвечать "это может быть..." или "возможно у вас..."
❌ Говорить что-то "не опасно" или "не серьезно"

⚠️ ЭКСТРЕННЫЕ СИТУАЦИИ (требуют НЕМЕДЛЕННОГО реагирования):
Если пользователь описывает:
- Сильную боль в груди, удушье, потерю сознания
- Серьезную травму, кровотечение
- Острую боль в животе, высокую температуру
- Суицидальные мысли или намерения
- Проблемы с дыханием

ТВОЙ ОТВЕТ ДОЛЖЕН БЫТЬ:
"⚠️ Это экстренная ситуация! Немедленно:
1. Вызовите скорую помощь: 103
2. Если в Минске: также можно позвонить 112
3. До приезда скорой оставайтесь на связи с диспетчером

Наша клиника работает в плановом режиме и не предназначена для экстренных случаев."

📋 КАК ОТВЕЧАТЬ НА МЕДИЦИНСКИЕ ВОПРОСЫ:

Пользователь: "У меня болит голова уже 3 дня, что это может быть?"
НЕПРАВИЛЬНО: "Возможно это мигрень или повышенное давление..."
ПРАВИЛЬНО: "Головная боль может иметь различные причины, которые нужно выяснить на очном осмотре. Рекомендую записаться к нашему терапевту или неврологу для профессиональной диагностики. Записаться можно по телефону ${clinicData.contacts?.phone_number || "уточните на сайте"}."

Пользователь: "Можно ли мне принимать ибупрофен при моих симптомах?"
НЕПРАВИЛЬНО: "Да, ибупрофен обычно помогает..."
ПРАВИЛЬНО: "Вопросы о приеме лекарств должен решать врач с учетом вашего анамнеза, аллергий и других факторов. Я не могу давать рекомендации по медикаментам. Пожалуйста, проконсультируйтесь с врачом - можем записать вас на ближайшее время."

Пользователь: "Посмотри мои анализы, всё ли нормально?"
ПРАВИЛЬНО: "Интерпретацию результатов анализов должен проводить квалифицированный врач на очном приеме, учитывая полную клиническую картину. Я могу помочь записать вас к специалисту, который профессионально оценит ваши результаты."

Пользователь: "Это опасно/серьезно?"
ПРАВИЛЬНО: "Оценку серьезности симптомов может дать только врач при осмотре. Рекомендую не откладывать визит к специалисту. Могу помочь записать вас на прием."

🎯 ПРАВИЛЬНАЯ ТАКТИКА:
1. Признай обеспокоенность пациента
2. Объясни, что диагностика требует очного осмотра
3. Порекомендуй конкретного специалиста из нашей клиники
4. Предложи записаться на прием
5. Укажи контакты для срочной записи

👶 ОСОБЫЕ ГРУППЫ ПАЦИЕНТОВ:
При вопросах о детях, беременных, пожилых - ВСЕГДА направляй к врачу:
"Вопросы, касающиеся [детей/беременных/пожилых пациентов], требуют особого внимания специалиста. Рекомендую записаться на консультацию к нашему врачу, который учтет все особенности."

💊 ВОПРОСЫ О ЛЕКАРСТВАХ:
Если спрашивают о:
- Взаимодействии лекарств
- Побочных эффектах
- Можно ли заменить препарат
- Дозировках

ВСЕГДА отвечай: "Вопросы о медикаментах должен решать лечащий врач с учетом полной картины вашего здоровья. Это важно для вашей безопасности. Могу записать вас на консультацию."

🧠 ПСИХОЛОГИЧЕСКИЕ ВОПРОСЫ:
При упоминании:
- Депрессии, тревоги, панических атак
- Суицидальных мыслей (ЭКСТРЕННО → скорая 103)
- Проблем со сном, стрессом

Направляй к психотерапевту/психиатру из клиники, НО не давай советов по самопомощи.

⚠️ КОГДА ПЕРЕНАПРАВЛЯТЬ К ОПЕРАТОРУ:
Если пользователь спрашивает о темах, НЕ связанных с клиникой, или хочет пообщаться с живым человеком, используй специальный маркер [NEED_OPERATOR] в КОНЦЕ твоего ответа.

Примеры когда нужен оператор:
- "Я хочу поговорить с менеджером"
- "Мне нужна помощь оператора"
- "Хочу пообщаться с живым человеком"
- "Вопросы о работе/вакансиях в клинике"
- "Жалобы или сложные вопросы, требующие вмешательства человека"
- "Вопросы о партнерстве, сотрудничестве"
- Любые темы НЕ относящиеся к услугам клиники

Формат ответа с перенаправлением:
"[Твой ответ о том, что поможет оператор]. [NEED_OPERATOR]"

Пример:
Пользователь: "Я хочу узнать о работе в клинике"
Ответ: "Понимаю, у вас вопрос о трудоустройстве. Сейчас я переключу вас на нашего оператора, который сможет предоставить всю необходимую информацию о вакансиях. [NEED_OPERATOR]"

ИНФОРМАЦИЯ О КЛИНИКЕ:

Контакты:
- Телефон: ${clinicData.contacts?.phone_number || "информация недоступна"}
${clinicData.contacts?.phone_number_sec ? `- Дополнительный телефон: ${clinicData.contacts.phone_number_sec}` : ""}
- Email: ${clinicData.contacts?.email || "информация недоступна"}
- Адрес: ${clinicData.contacts?.address || "информация недоступна"}
- Режим работы: ${clinicData.contacts?.work_hours_main || "Пн-Сб 09:00-20:00"}
- Воскресенье: ${clinicData.contacts?.work_hours_sunday || "10:00-18:00"}

Наши услуги:
${servicesText || "Информация загружается..."}

Наши специалисты:
${specialistsText || "Информация загружается..."}

ИНФОРМАЦИЯ ДЛЯ ПАЦИЕНТОВ:

Как записаться на приём:
- По телефону: ${clinicData.contacts?.phone_number || "уточните на сайте"}
- Через сайт клиники
- Лично в клинике по адресу: ${clinicData.contacts?.address || "уточните на сайте"}

Что взять с собой на первый приём:
- Паспорт или документ, удостоверяющий личность
- Результаты предыдущих обследований и анализов (если есть)
- Список принимаемых лекарств
- Медицинскую карту из другой клиники (если есть)

Подготовка к приёму:
- На УЗИ органов брюшной полости - натощак (не есть 6-8 часов)
- На анализы крови - натощак (не есть 8-12 часов)
- На приём к гинекологу - стандартная гигиена
- На стоматологический приём - почистить зубы

Оплата:
- Наличными в кассе клиники
- Банковской картой
- Безналичный расчёт для организаций

Помни: если пациент спрашивает про симптомы или лечение - НЕ давай медицинских советов, а рекомендуй записаться к соответствующему специалисту.`;
}

export async function POST(request: NextRequest) {
  try {

    // Проверяем подключение к Prisma
    try {
      await prisma.$connect();
    } catch (dbError) {
    }

    if (!OPENROUTER_API_KEY) {
      return NextResponse.json(
        { error: "OpenRouter API key not configured. Please add OPENROUTER_API_KEY to your .env file." },
        {
          status: 500,
          headers: {
            'Cache-Control': 'no-store, no-cache, must-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0',
          }
        }
      );
    }

    const body = await request.json();

    const { messages } = body;

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { error: "Invalid messages format" },
        {
          status: 400,
          headers: {
            'Cache-Control': 'no-store, no-cache, must-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0',
          }
        }
      );
    }

    // Получаем контекст клиники
    const clinicData = await getClinicContext();

    // Если не удалось загрузить данные, используем базовую информацию
    const finalClinicData = clinicData || {
      contacts: {
        phone_number: "+375(29)161-01-01",
        email: "smartmedical.by@gmail.com",
        address: "г. Минск, пр. Победителей, д. 119, пом. 504",
        work_hours_main: "Пн-Сб 09:00-20:00",
        work_hours_sunday: "Вс 10:00-18:00",
      },
      services: [],
      specialists: [],
    };

    if (!clinicData) {
    }

    // Создаём системный промпт
    const systemPrompt = buildSystemPrompt(finalClinicData);

    // Отправляем запрос в OpenRouter
    const response = await fetch(OPENROUTER_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
        "HTTP-Referer": process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
        "X-Title": "Doctor Family Medical Clinic",
      },
      body: JSON.stringify({
        model: "openai/gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: systemPrompt,
          },
          ...messages,
        ],
        temperature: 0.7,
        max_tokens: 500,
      }),
    });


    if (!response.ok) {
      const error = await response.text();
      return NextResponse.json(
        { error: `Failed to get response from AI: ${error.substring(0, 100)}` },
        {
          status: response.status,
          headers: {
            'Cache-Control': 'no-store, no-cache, must-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0',
          }
        }
      );
    }

    const data = await response.json();

    const assistantMessage = data.choices?.[0]?.message?.content;

    if (!assistantMessage) {
      return NextResponse.json(
        { error: "No response from AI" },
        {
          status: 500,
          headers: {
            'Cache-Control': 'no-store, no-cache, must-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0',
          }
        }
      );
    }

    const { message: cleanMessage, cards } = await parseCardsInMessage(assistantMessage);

    // Проверяем наличие маркера [NEED_OPERATOR]
    const needOperator = cleanMessage.includes("[NEED_OPERATOR]");

    // Удаляем плейсхолдеры карточек из сообщения
    let finalMessage = cleanMessage;
    cards.forEach((card) => {
      finalMessage = finalMessage.replace(card.placeholder, "");
    });

    // Удаляем маркер оператора из сообщения
    finalMessage = finalMessage.replace("[NEED_OPERATOR]", "").trim();

    return NextResponse.json(
      {
        message: finalMessage,
        cards: cards,
        needOperator: needOperator,
      },
      {
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0',
        }
      }
    );
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: `Internal server error: ${errorMessage}` },
      {
        status: 500,
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0',
        }
      }
    );
  }
}
