import { Prisma, PrismaClient } from '@prisma/client';
import {
  makeAppointmentKey,
  makeCatalogKey,
  makeFeedbackKey,
  makeLetterKey,
  makeLetterMessageKey,
  makeMaterialKey,
  makeOperatorChatKey,
  makeOperatorChatMessageKey,
  makePartnerKey,
  makeQuestionKey,
  makeVacancyKey,
} from './keys';

export type FullDatabaseExport = {
  exportedAt: string;
  serviceCategories: Array<{
    slug: string;
    parentSlug: string | null;
    name: string;
    icon: string | null;
    description: string | null;
    order: number;
    is_active: boolean;
  }>;
  partnerCategories: Array<{ slug: string; name: string }>;
  questionCategories: Array<{
    slug: string;
    name: string;
    description: string | null;
    order: number;
    is_active: boolean;
  }>;
  contacts: Array<{
    address: string;
    map_geo: string;
    work_hours_main: string;
    work_hours_sunday: string;
    phone_number: string;
    phone_number_sec: string | null;
    email: string;
  }>;
  materials: Array<{
    key: string;
    title: string;
    content: string;
    detailed_content: string | null;
    image_url: string;
    date: string;
    year: number;
    is_active: boolean;
  }>;
  vacancies: Array<{
    key: string;
    name: string;
    category: string;
    description: string;
    payment: number;
    experience: number;
    requirements: string;
  }>;
  patients: Array<{
    email: string;
    login: string;
    password: string;
    name: string;
    phone: string;
    registration_date: string;
    avatar_url: string | null;
    role: string;
    is_messages_blocked: boolean;
  }>;
  specialists: Array<{
    key: string;
    categorySlug: string;
    name: string;
    specialization: string;
    qualification: string;
    experience: number;
    grade: number;
    image_url: string;
    activity_area: string | null;
    education_details: string | null;
    conferences: string[];
    specializations: string[];
    education: string[];
    work_examples: Prisma.JsonValue | null;
  }>;
  services: Array<{
    key: string;
    categorySlug: string;
    title: string;
    subtitle: string;
    price: number;
    video_url: string;
    description: string;
    image_url: string;
    image_url_1: string;
    image_url_2: string;
    image_url_3: string;
    image_url_4: string | null;
    questions_id: number;
    reviews_id: number;
    specialistKeys: string[];
  }>;
  questions: Array<{
    key: string;
    question: string;
    answer: string | null;
    serviceKey: string | null;
    questionCategorySlug: string | null;
  }>;
  feedbacks: Array<{
    key: string;
    name: string;
    text: string;
    date: string;
    grade: number;
    image_url: string;
    verified: boolean;
    serviceKey: string | null;
  }>;
  partners: Array<{
    key: string;
    categorySlug: string;
    name: string;
    description: string;
    image_url: string;
    number: number;
    website_url: string;
  }>;
  letters: Array<{
    key: string;
    patientEmail: string;
    subject: string;
    content: string;
    created_at: string;
    reply: string | null;
    replied_at: string | null;
    is_read: boolean;
    is_reply_read: boolean;
    has_new_patient_message: boolean;
  }>;
  letterMessages: Array<{
    key: string;
    letterKey: string;
    sender_type: string;
    content: string;
    created_at: string;
    is_read: boolean;
  }>;
  operatorChats: Array<{
    key: string;
    patientEmail: string;
    operatorEmail: string | null;
    status: string;
    created_at: string;
    updated_at: string;
    last_message_at: string | null;
    has_unread_operator: boolean;
    has_unread_patient: boolean;
  }>;
  operatorChatMessages: Array<{
    key: string;
    chatKey: string;
    senderEmail: string;
    sender_type: string;
    content: string;
    created_at: string;
    is_read: boolean;
  }>;
  appointments: Array<{
    key: string;
    patientEmail: string;
    specialistKey: string;
    serviceKey: string | null;
    scheduled_at: string;
    duration_minutes: number;
    status: string;
    note: string | null;
    admin_comment: string | null;
    created_at: string;
    updated_at: string;
  }>;
};

export async function exportFullDatabase(prisma: PrismaClient): Promise<FullDatabaseExport> {
  const serviceCategoriesRaw = await prisma.serviceCategory.findMany({ orderBy: { id: 'asc' } });
  const serviceCategorySlugById = new Map(serviceCategoriesRaw.map((c) => [c.id, c.slug]));

  const partnerCategoriesRaw = await prisma.category.findMany({ orderBy: { id: 'asc' } });
  const partnerCategorySlugById = new Map(partnerCategoriesRaw.map((c) => [c.id, c.slug]));

  const questionCategoriesRaw = await prisma.questionCategory.findMany({ orderBy: { id: 'asc' } });
  const questionCategorySlugById = new Map(questionCategoriesRaw.map((c) => [c.id, c.slug]));

  const patientsRaw = await prisma.patient.findMany({ orderBy: { id: 'asc' } });
  const patientEmailById = new Map(patientsRaw.map((p) => [p.id, p.email]));

  const specialistsRaw = await prisma.specialist.findMany({ orderBy: { id: 'asc' } });
  const specialistIdToKey = new Map<number, string>();
  const specialists = specialistsRaw.map((s) => {
    const categorySlug = serviceCategorySlugById.get(s.service_category_id);
    if (!categorySlug) throw new Error(`Specialist ${s.id} missing category`);
    const key = makeCatalogKey(s.name, categorySlug);
    specialistIdToKey.set(s.id, key);
    return {
      key,
      categorySlug,
      name: s.name,
      specialization: s.specialization,
      qualification: s.qualification,
      experience: s.experience,
      grade: s.grade,
      image_url: s.image_url,
      activity_area: s.activity_area,
      education_details: s.education_details,
      conferences: s.conferences,
      specializations: s.specializations,
      education: s.education,
      work_examples: s.work_examples,
    };
  });

  const servicesRaw = await prisma.service.findMany({
    include: { specialists: true },
    orderBy: { id: 'asc' },
  });
  const serviceIdToKey = new Map<number, string>();
  const services = servicesRaw.map((s) => {
    const categorySlug = serviceCategorySlugById.get(s.service_category_id);
    if (!categorySlug) throw new Error(`Service ${s.id} missing category`);
    const key = makeCatalogKey(s.title, categorySlug);
    serviceIdToKey.set(s.id, key);
    return {
      key,
      categorySlug,
      title: s.title,
      subtitle: s.subtitle,
      price: s.price,
      video_url: s.video_url,
      description: s.description,
      image_url: s.image_url,
      image_url_1: s.image_url_1,
      image_url_2: s.image_url_2,
      image_url_3: s.image_url_3,
      image_url_4: s.image_url_4,
      questions_id: s.questions_id,
      reviews_id: s.reviews_id,
      specialistKeys: s.specialists
        .map((link) => specialistIdToKey.get(link.specialist_id))
        .filter((k): k is string => Boolean(k)),
    };
  });

  const questionsRaw = await prisma.question.findMany({ orderBy: { id: 'asc' } });
  const questions = questionsRaw.map((q) => {
    const serviceKey = q.service_id ? serviceIdToKey.get(q.service_id) ?? null : null;
    const questionCategorySlug = q.question_category_id
      ? questionCategorySlugById.get(q.question_category_id) ?? null
      : null;
    return {
      key: makeQuestionKey(q.question, serviceKey, questionCategorySlug),
      question: q.question,
      answer: q.answer,
      serviceKey,
      questionCategorySlug,
    };
  });

  const feedbacksRaw = await prisma.feedback.findMany({ orderBy: { id: 'asc' } });
  const feedbacks = feedbacksRaw.map((f) => {
    const date = f.date.toISOString().slice(0, 10);
    const serviceKey = f.service_id ? serviceIdToKey.get(f.service_id) ?? null : null;
    return {
      key: makeFeedbackKey(f.name, date, f.text),
      name: f.name,
      text: f.text,
      date,
      grade: f.grade,
      image_url: f.image_url,
      verified: f.verified,
      serviceKey,
    };
  });

  const partnersRaw = await prisma.partner.findMany({ orderBy: { id: 'asc' } });
  const partners = partnersRaw.map((p) => {
    const categorySlug = partnerCategorySlugById.get(p.category_id);
    if (!categorySlug) throw new Error(`Partner ${p.id} missing category`);
    return {
      key: makePartnerKey(p.name, categorySlug),
      categorySlug,
      name: p.name,
      description: p.description,
      image_url: p.image_url,
      number: p.number,
      website_url: p.website_url,
    };
  });

  const lettersRaw = await prisma.letter.findMany({ orderBy: { id: 'asc' } });
  const letterIdToKey = new Map<number, string>();
  const letters = lettersRaw.map((l) => {
    const patientEmail = patientEmailById.get(l.patient_id);
    if (!patientEmail) throw new Error(`Letter ${l.id} missing patient`);
    const created_at = l.created_at.toISOString();
    const key = makeLetterKey(patientEmail, l.subject, created_at);
    letterIdToKey.set(l.id, key);
    return {
      key,
      patientEmail,
      subject: l.subject,
      content: l.content,
      created_at,
      reply: l.reply,
      replied_at: l.replied_at?.toISOString() ?? null,
      is_read: l.is_read,
      is_reply_read: l.is_reply_read,
      has_new_patient_message: l.has_new_patient_message,
    };
  });

  const letterMessagesRaw = await prisma.letterMessage.findMany({ orderBy: { id: 'asc' } });
  const letterMessages = letterMessagesRaw
    .map((m) => {
      const letterKey = letterIdToKey.get(m.letter_id);
      if (!letterKey) return null;
      const created_at = m.created_at.toISOString();
      return {
        key: makeLetterMessageKey(letterKey, m.sender_type, created_at, m.content),
        letterKey,
        sender_type: m.sender_type,
        content: m.content,
        created_at,
        is_read: m.is_read,
      };
    })
    .filter((m): m is NonNullable<typeof m> => Boolean(m));

  const operatorChatsRaw = await prisma.operatorChat.findMany({ orderBy: { id: 'asc' } });
  const operatorChatIdToKey = new Map<number, string>();
  const operatorChats = operatorChatsRaw.map((c) => {
    const patientEmail = patientEmailById.get(c.patient_id);
    if (!patientEmail) throw new Error(`OperatorChat ${c.id} missing patient`);
    const created_at = c.created_at.toISOString();
    const key = makeOperatorChatKey(patientEmail, created_at);
    operatorChatIdToKey.set(c.id, key);
    return {
      key,
      patientEmail,
      operatorEmail: c.operator_id ? patientEmailById.get(c.operator_id) ?? null : null,
      status: c.status,
      created_at,
      updated_at: c.updated_at.toISOString(),
      last_message_at: c.last_message_at?.toISOString() ?? null,
      has_unread_operator: c.has_unread_operator,
      has_unread_patient: c.has_unread_patient,
    };
  });

  const operatorChatMessagesRaw = await prisma.operatorChatMessage.findMany({
    orderBy: { id: 'asc' },
  });
  const operatorChatMessages = operatorChatMessagesRaw
    .map((m) => {
      const chatKey = operatorChatIdToKey.get(m.chat_id);
      const senderEmail = patientEmailById.get(m.sender_id);
      if (!chatKey || !senderEmail) return null;
      const created_at = m.created_at.toISOString();
      return {
        key: makeOperatorChatMessageKey(chatKey, senderEmail, created_at, m.content),
        chatKey,
        senderEmail,
        sender_type: m.sender_type,
        content: m.content,
        created_at,
        is_read: m.is_read,
      };
    })
    .filter((m): m is NonNullable<typeof m> => Boolean(m));

  const appointmentsRaw = await prisma.appointment.findMany({ orderBy: { id: 'asc' } });
  const appointments = appointmentsRaw
    .map((a) => {
      const patientEmail = patientEmailById.get(a.patient_id);
      const specialistKey = specialistIdToKey.get(a.specialist_id);
      if (!patientEmail || !specialistKey) return null;
      const scheduled_at = a.scheduled_at.toISOString();
      const serviceKey = a.service_id ? serviceIdToKey.get(a.service_id) ?? null : null;
      return {
        key: makeAppointmentKey(patientEmail, specialistKey, scheduled_at),
        patientEmail,
        specialistKey,
        serviceKey,
        scheduled_at,
        duration_minutes: a.duration_minutes,
        status: a.status,
        note: a.note,
        admin_comment: a.admin_comment,
        created_at: a.created_at.toISOString(),
        updated_at: a.updated_at.toISOString(),
      };
    })
    .filter((a): a is NonNullable<typeof a> => Boolean(a));

  return {
    exportedAt: new Date().toISOString(),
    serviceCategories: serviceCategoriesRaw.map((c) => ({
      slug: c.slug,
      parentSlug: c.parent_id ? serviceCategorySlugById.get(c.parent_id) ?? null : null,
      name: c.name,
      icon: c.icon,
      description: c.description,
      order: c.order,
      is_active: c.is_active,
    })),
    partnerCategories: partnerCategoriesRaw.map((c) => ({ slug: c.slug, name: c.name })),
    questionCategories: questionCategoriesRaw.map((c) => ({
      slug: c.slug,
      name: c.name,
      description: c.description,
      order: c.order,
      is_active: c.is_active,
    })),
    contacts: await prisma.contacts.findMany({
      orderBy: { id: 'asc' },
      select: {
        address: true,
        map_geo: true,
        work_hours_main: true,
        work_hours_sunday: true,
        phone_number: true,
        phone_number_sec: true,
        email: true,
      },
    }),
    materials: (await prisma.material.findMany({ orderBy: { id: 'asc' } })).map((m) => ({
      key: makeMaterialKey(m.title, m.year),
      title: m.title,
      content: m.content,
      detailed_content: m.detailed_content,
      image_url: m.image_url,
      date: m.date.toISOString().slice(0, 10),
      year: m.year,
      is_active: m.is_active,
    })),
    vacancies: (await prisma.vacancy.findMany({ orderBy: { id: 'asc' } })).map((v) => ({
      key: makeVacancyKey(v.name, v.category),
      name: v.name,
      category: v.category,
      description: v.description,
      payment: v.payment,
      experience: v.experience,
      requirements: v.requirements,
    })),
    patients: patientsRaw.map((p) => ({
      email: p.email,
      login: p.login,
      password: p.password,
      name: p.name,
      phone: p.phone,
      registration_date: p.registration_date.toISOString().slice(0, 10),
      avatar_url: p.avatar_url,
      role: p.role,
      is_messages_blocked: p.is_messages_blocked,
    })),
    specialists,
    services,
    questions,
    feedbacks,
    partners,
    letters,
    letterMessages,
    operatorChats,
    operatorChatMessages,
    appointments,
  };
}

export function summarizeExport(data: FullDatabaseExport) {
  return {
    serviceCategories: data.serviceCategories.length,
    partnerCategories: data.partnerCategories.length,
    questionCategories: data.questionCategories.length,
    contacts: data.contacts.length,
    materials: data.materials.length,
    vacancies: data.vacancies.length,
    patients: data.patients.length,
    specialists: data.specialists.length,
    services: data.services.length,
    questions: data.questions.length,
    feedbacks: data.feedbacks.length,
    partners: data.partners.length,
    letters: data.letters.length,
    letterMessages: data.letterMessages.length,
    operatorChats: data.operatorChats.length,
    operatorChatMessages: data.operatorChatMessages.length,
    appointments: data.appointments.length,
    serviceLinks: data.services.reduce((sum, s) => sum + s.specialistKeys.length, 0),
  };
}
