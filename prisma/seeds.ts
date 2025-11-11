import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Clean existing data in dependency order
  await prisma.question.deleteMany();
  await prisma.feedback.deleteMany();
  await prisma.service.deleteMany();
  await prisma.specialist.deleteMany();
  await prisma.partner.deleteMany();
  await prisma.category.deleteMany();
  await prisma.vacancy.deleteMany();
  await prisma.contacts.deleteMany();
  await prisma.patient.deleteMany();

  // Categories
  const dentistry = await prisma.category.create({
    data: {
      name: 'Стоматология'
    }
  });

  const cardiology = await prisma.category.create({
    data: {
      name: 'Кардиология'
    }
  });

  // Specialists
  const specialistIvanov = await prisma.specialist.create({
    data: {
      category_id: dentistry.id,
      name: 'Иванов Иван Иванович',
      specialization: 'Стоматолог-терапевт',
      qualification: 'Врач высшей категории',
      experience: 10,
      grade: 5,
      image_url: '/images/doctor_ivanov.jpg',
      activity_area: 'Лечение кариеса, реставрация зубов',
      education_details: 'МГМСУ, интернатура по терапевтической стоматологии',
      conferences: 'StomExpo 2023, DentalTech 2024'
    }
  });

  const specialistPetrova = await prisma.specialist.create({
    data: {
      category_id: cardiology.id,
      name: 'Петрова Анна Сергеевна',
      specialization: 'Кардиолог',
      qualification: 'Кандидат медицинских наук',
      experience: 12,
      grade: 5,
      image_url: '/images/doctor_petrova.jpg',
      activity_area: 'Диагностика и лечение сердечно-сосудистых заболеваний',
      education_details: 'РНИМУ им. Пирогова, ординатура по кардиологии',
      conferences: 'CardioForum 2024'
    }
  });

  // Partners
  await prisma.partner.createMany({
    data: [
      {
        category_id: dentistry.id,
        image_url: '/images/partner_swiss.jpg',
        name: 'SwissDental',
        description: 'Поставщик стоматологических материалов премиум-класса',
        number: 1,
        website_url: 'https://swissdental.example.com'
      },
      {
        category_id: cardiology.id,
        image_url: '/images/partner_cardio.jpg',
        name: 'CardioTech',
        description: 'Инновационное кардиологическое оборудование',
        number: 2,
        website_url: 'https://cardiotech.example.com'
      }
    ]
  });

  // Services
  const serviceCaries = await prisma.service.create({
    data: {
      title: 'Лечение кариеса',
      subtitle: 'Щадящие методики и современные материалы',
      price: 4500,
      video_url: 'https://videos.example.com/dentistry/caries',
      description:
        'Комплексное лечение кариеса с использованием микроскопа и композитных материалов последнего поколения. Индивидуальный подход и безболезненная анестезия.',
      specialists_id: specialistIvanov.id,
      image_url: '/images/services/caries_main.jpg',
      image_url_1: '/images/services/caries_1.jpg',
      image_url_2: '/images/services/caries_2.jpg',
      image_url_3: '/images/services/caries_3.jpg',
      image_url_4: '/images/services/caries_4.jpg',
      questions_id: 0, // legacy field in schema, not used as relation
      reviews_id: 0, // legacy field in schema, not used as relation
      category_id: dentistry.id
    }
  });

  const serviceEcho = await prisma.service.create({
    data: {
      title: 'ЭХО-КГ (УЗИ сердца)',
      subtitle: 'Высокоточная диагностика сердечных заболеваний',
      price: 3500,
      video_url: 'https://videos.example.com/cardiology/echo',
      description:
        'Эхокардиография на современном аппарате экспертного класса. Расширенная оценка структуры и функции сердца, заключение специалиста.',
      specialists_id: specialistPetrova.id,
      image_url: '/images/services/echo_main.jpg',
      image_url_1: '/images/services/echo_1.jpg',
      image_url_2: '/images/services/echo_2.jpg',
      image_url_3: '/images/services/echo_3.jpg',
      image_url_4: null,
      questions_id: 0,
      reviews_id: 0,
      category_id: cardiology.id
    }
  });

  // Questions for services
  await prisma.question.createMany({
    data: [
      {
        question: 'Больно ли лечить кариес?',
        answer: 'Мы используем современную анестезию, поэтому лечение проходит комфортно.',
        service_id: serviceCaries.id
      },
      {
        question: 'Сколько длится процедура?',
        answer: 'В среднем 40–60 минут в зависимости от сложности случая.',
        service_id: serviceCaries.id
      },
      {
        question: 'Нужна ли подготовка к ЭХО-КГ?',
        answer: 'Специальная подготовка не требуется, исследование безопасно и безболезненно.',
        service_id: serviceEcho.id
      }
    ]
  });

  // Feedbacks for services
  await prisma.feedback.createMany({
    data: [
      {
        name: 'Мария',
        text: 'Отличная клиника! Лечение кариеса прошло быстро и без боли.',
        date: new Date('2024-03-12'),
        grade: 5,
        image_url: '/images/avatars/maria.jpg',
        service_id: serviceCaries.id
      },
      {
        name: 'Алексей',
        text: 'Грамотный кардиолог, всё подробно объяснила. Рекомендую!',
        date: new Date('2024-04-05'),
        grade: 5,
        image_url: '/images/avatars/alexey.jpg',
        service_id: serviceEcho.id
      }
    ]
  });

  // Vacancies
  await prisma.vacancy.createMany({
    data: [
      {
        name: 'Медицинская сестра (кардиология)',
        category: 'Кардиология',
        description: 'Помощь врачу-кардиологу, подготовка кабинета и оборудования.',
        payment: 65000,
        experience: 2,
        requirements: 'Среднее мед. образование, действующий сертификат.'
      },
      {
        name: 'Стоматолог-ортопед',
        category: 'Стоматология',
        description: 'Протезирование, работа с имплантами, диагностика.',
        payment: 120000,
        experience: 5,
        requirements: 'Высшее мед. образование, ординатура по ортопедии.'
      }
    ]
  });

  // Contacts
  await prisma.contacts.create({
    data: {
      address: 'г. Москва, ул. Ленина, д. 10',
      map_geo: '55.7558,37.6173',
      work_hours_main: 'Пн–Сб 09:00–20:00',
      work_hours_sunday: 'Вс 10:00–18:00',
      phone_number: '+7 (495) 123-45-67',
      phone_number_sec: '+7 (495) 765-43-21',
      email: 'info@smartmedical.example.com'
    }
  });

  // Patients
  await prisma.patient.createMany({
    data: [
      {
        login: 'patient1',
        email: 'patient1@example.com',
        password: 'password123',
        name: 'Смирнов Пётр',
        phone: 79001234567,
        registration_date: new Date('2024-01-15')
      },
      {
        login: 'patient2',
        email: 'patient2@example.com',
        password: 'password123',
        name: 'Иванова Мария',
        phone: 79007654321,
        registration_date: new Date('2024-02-10')
      }
    ]
  });

  console.log('✅ Seed data has been inserted successfully.');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });