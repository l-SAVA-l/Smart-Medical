import { Prisma, PrismaClient, Role, ChatStatus } from '@prisma/client';
import type { FullDatabaseExport } from './export-full';

async function upsertServiceCategories(
  prisma: PrismaClient,
  items: FullDatabaseExport['serviceCategories']
) {
  const idBySlug = new Map<string, number>();
  const pending = [...items];
  let guard = 0;

  while (pending.length > 0 && guard < items.length + 5) {
    guard++;
    const nextRound: typeof pending = [];

    for (const item of pending) {
      if (item.parentSlug && !idBySlug.has(item.parentSlug)) {
        nextRound.push(item);
        continue;
      }

      const parent_id = item.parentSlug ? idBySlug.get(item.parentSlug)! : null;
      const record = await prisma.serviceCategory.upsert({
        where: { slug: item.slug },
        create: {
          slug: item.slug,
          name: item.name,
          icon: item.icon,
          description: item.description,
          order: item.order,
          is_active: item.is_active,
          parent_id,
        },
        update: {
          name: item.name,
          icon: item.icon,
          description: item.description,
          order: item.order,
          is_active: item.is_active,
          parent_id,
        },
      });
      idBySlug.set(item.slug, record.id);
    }

    if (nextRound.length === pending.length) {
      throw new Error('Failed to resolve service category parent chain');
    }
    pending.splice(0, pending.length, ...nextRound);
  }

  return idBySlug;
}

export async function importFullDatabase(prisma: PrismaClient, data: FullDatabaseExport) {
  console.log(`📥 Import from export ${data.exportedAt}`);

  const serviceCategoryIdBySlug = await upsertServiceCategories(prisma, data.serviceCategories);
  console.log(`  ✓ service_categories: ${serviceCategoryIdBySlug.size}`);

  const partnerCategoryIdBySlug = new Map<string, number>();
  for (const item of data.partnerCategories) {
    const record = await prisma.category.upsert({
      where: { slug: item.slug },
      create: { slug: item.slug, name: item.name },
      update: { name: item.name },
    });
    partnerCategoryIdBySlug.set(item.slug, record.id);
  }
  console.log(`  ✓ categories (partners): ${partnerCategoryIdBySlug.size}`);

  const questionCategoryIdBySlug = new Map<string, number>();
  for (const item of data.questionCategories) {
    const record = await prisma.questionCategory.upsert({
      where: { slug: item.slug },
      create: {
        slug: item.slug,
        name: item.name,
        description: item.description,
        order: item.order,
        is_active: item.is_active,
      },
      update: {
        name: item.name,
        description: item.description,
        order: item.order,
        is_active: item.is_active,
      },
    });
    questionCategoryIdBySlug.set(item.slug, record.id);
  }
  console.log(`  ✓ question_categories: ${questionCategoryIdBySlug.size}`);

  await prisma.contacts.deleteMany({});
  if (data.contacts.length > 0) {
    await prisma.contacts.createMany({ data: data.contacts });
  }
  console.log(`  ✓ contacts: ${data.contacts.length}`);

  const patientIdByEmail = new Map<string, number>();
  for (const item of data.patients) {
    const record = await prisma.patient.upsert({
      where: { email: item.email },
      create: {
        email: item.email,
        login: item.login,
        password: item.password,
        name: item.name,
        phone: item.phone,
        registration_date: new Date(item.registration_date),
        avatar_url: item.avatar_url,
        role: item.role as Role,
        is_messages_blocked: item.is_messages_blocked,
      },
      update: {
        login: item.login,
        password: item.password,
        name: item.name,
        phone: item.phone,
        registration_date: new Date(item.registration_date),
        avatar_url: item.avatar_url,
        role: item.role as Role,
        is_messages_blocked: item.is_messages_blocked,
      },
    });
    patientIdByEmail.set(item.email, record.id);
  }
  console.log(`  ✓ patients: ${patientIdByEmail.size}`);

  const specialistIdByKey = new Map<string, number>();
  for (const item of data.specialists) {
    const categoryId = serviceCategoryIdBySlug.get(item.categorySlug);
    if (!categoryId) continue;

    const existing = await prisma.specialist.findFirst({
      where: { name: item.name, service_category_id: categoryId },
    });

    const payload = {
      name: item.name,
      specialization: item.specialization,
      qualification: item.qualification,
      experience: item.experience,
      grade: item.grade,
      image_url: item.image_url,
      activity_area: item.activity_area,
      education_details: item.education_details,
      conferences: item.conferences,
      specializations: item.specializations,
      education: item.education,
      work_examples: item.work_examples as Prisma.InputJsonValue,
      service_category_id: categoryId,
    };

    const record = existing
      ? await prisma.specialist.update({ where: { id: existing.id }, data: payload })
      : await prisma.specialist.create({ data: payload });

    specialistIdByKey.set(item.key, record.id);
  }
  console.log(`  ✓ specialists: ${specialistIdByKey.size}`);

  const serviceIdByKey = new Map<string, number>();
  for (const item of data.services) {
    const categoryId = serviceCategoryIdBySlug.get(item.categorySlug);
    if (!categoryId) continue;

    const existing = await prisma.service.findFirst({
      where: { title: item.title, service_category_id: categoryId },
    });

    const payload = {
      title: item.title,
      subtitle: item.subtitle,
      price: item.price,
      video_url: item.video_url,
      description: item.description,
      image_url: item.image_url,
      image_url_1: item.image_url_1,
      image_url_2: item.image_url_2,
      image_url_3: item.image_url_3,
      image_url_4: item.image_url_4,
      questions_id: item.questions_id || 1,
      reviews_id: item.reviews_id || 1,
      service_category_id: categoryId,
    };

    const record = existing
      ? await prisma.service.update({ where: { id: existing.id }, data: payload })
      : await prisma.service.create({ data: payload });

    serviceIdByKey.set(item.key, record.id);
  }
  console.log(`  ✓ services: ${serviceIdByKey.size}`);

  let links = 0;
  for (const item of data.services) {
    const serviceId = serviceIdByKey.get(item.key);
    if (!serviceId) continue;
    for (const specialistKey of item.specialistKeys) {
      const specialistId = specialistIdByKey.get(specialistKey);
      if (!specialistId) continue;
      await prisma.serviceSpecialist.upsert({
        where: {
          service_id_specialist_id: { service_id: serviceId, specialist_id: specialistId },
        },
        create: { service_id: serviceId, specialist_id: specialistId },
        update: {},
      });
      links++;
    }
  }
  console.log(`  ✓ service_specialists: ${links}`);

  for (const item of data.materials) {
    const existing = await prisma.material.findFirst({
      where: { title: item.title, year: item.year },
    });
    const payload = {
      title: item.title,
      content: item.content,
      detailed_content: item.detailed_content,
      image_url: item.image_url,
      date: new Date(item.date),
      year: item.year,
      is_active: item.is_active,
    };
    if (existing) {
      await prisma.material.update({ where: { id: existing.id }, data: payload });
    } else {
      await prisma.material.create({ data: payload });
    }
  }
  console.log(`  ✓ materials: ${data.materials.length}`);

  for (const item of data.vacancies) {
    const existing = await prisma.vacancy.findFirst({
      where: { name: item.name, category: item.category },
    });
    const payload = {
      name: item.name,
      category: item.category,
      description: item.description,
      payment: item.payment,
      experience: item.experience,
      requirements: item.requirements,
    };
    if (existing) {
      await prisma.vacancy.update({ where: { id: existing.id }, data: payload });
    } else {
      await prisma.vacancy.create({ data: payload });
    }
  }
  console.log(`  ✓ vacancies: ${data.vacancies.length}`);

  for (const item of data.partners) {
    const categoryId = partnerCategoryIdBySlug.get(item.categorySlug);
    if (!categoryId) continue;
    const existing = await prisma.partner.findFirst({
      where: { name: item.name, category_id: categoryId },
    });
    const payload = {
      name: item.name,
      description: item.description,
      image_url: item.image_url,
      number: item.number,
      website_url: item.website_url,
      category_id: categoryId,
    };
    if (existing) {
      await prisma.partner.update({ where: { id: existing.id }, data: payload });
    } else {
      await prisma.partner.create({ data: payload });
    }
  }
  console.log(`  ✓ partners: ${data.partners.length}`);

  for (const item of data.questions) {
    const service_id = item.serviceKey ? serviceIdByKey.get(item.serviceKey) ?? null : null;
    const question_category_id = item.questionCategorySlug
      ? questionCategoryIdBySlug.get(item.questionCategorySlug) ?? null
      : null;

    const existing = await prisma.question.findFirst({
      where: {
        question: item.question,
        service_id,
        question_category_id,
      },
    });

    const payload = {
      question: item.question,
      answer: item.answer,
      service_id,
      question_category_id,
    };

    if (existing) {
      await prisma.question.update({ where: { id: existing.id }, data: payload });
    } else {
      await prisma.question.create({ data: payload });
    }
  }
  console.log(`  ✓ questions: ${data.questions.length}`);

  for (const item of data.feedbacks) {
    const service_id = item.serviceKey ? serviceIdByKey.get(item.serviceKey) ?? null : null;
    const existing = await prisma.feedback.findFirst({
      where: {
        name: item.name,
        date: new Date(item.date),
        text: item.text,
      },
    });
    const payload = {
      name: item.name,
      text: item.text,
      date: new Date(item.date),
      grade: item.grade,
      image_url: item.image_url,
      verified: item.verified,
      service_id,
    };
    if (existing) {
      await prisma.feedback.update({ where: { id: existing.id }, data: payload });
    } else {
      await prisma.feedback.create({ data: payload });
    }
  }
  console.log(`  ✓ feedbacks: ${data.feedbacks.length}`);

  const letterIdByKey = new Map<string, number>();
  for (const item of data.letters) {
    const patient_id = patientIdByEmail.get(item.patientEmail);
    if (!patient_id) continue;

    const existing = await prisma.letter.findFirst({
      where: {
        patient_id,
        subject: item.subject,
        created_at: new Date(item.created_at),
      },
    });

    const payload = {
      patient_id,
      subject: item.subject,
      content: item.content,
      created_at: new Date(item.created_at),
      reply: item.reply,
      replied_at: item.replied_at ? new Date(item.replied_at) : null,
      is_read: item.is_read,
      is_reply_read: item.is_reply_read,
      has_new_patient_message: item.has_new_patient_message,
    };

    const record = existing
      ? await prisma.letter.update({ where: { id: existing.id }, data: payload })
      : await prisma.letter.create({ data: payload });

    letterIdByKey.set(item.key, record.id);
  }
  console.log(`  ✓ letters: ${letterIdByKey.size}`);

  for (const item of data.letterMessages) {
    const letter_id = letterIdByKey.get(item.letterKey);
    if (!letter_id) continue;

    const existing = await prisma.letterMessage.findFirst({
      where: {
        letter_id,
        sender_type: item.sender_type,
        created_at: new Date(item.created_at),
        content: item.content,
      },
    });

    const payload = {
      letter_id,
      sender_type: item.sender_type,
      content: item.content,
      created_at: new Date(item.created_at),
      is_read: item.is_read,
    };

    if (existing) {
      await prisma.letterMessage.update({ where: { id: existing.id }, data: payload });
    } else {
      await prisma.letterMessage.create({ data: payload });
    }
  }
  console.log(`  ✓ letter_messages: ${data.letterMessages.length}`);

  const operatorChatIdByKey = new Map<string, number>();
  for (const item of data.operatorChats) {
    const patient_id = patientIdByEmail.get(item.patientEmail);
    if (!patient_id) continue;
    const operator_id = item.operatorEmail
      ? patientIdByEmail.get(item.operatorEmail) ?? null
      : null;

    const existing = await prisma.operatorChat.findFirst({
      where: {
        patient_id,
        created_at: new Date(item.created_at),
      },
    });

    const payload = {
      patient_id,
      operator_id,
      status: item.status as ChatStatus,
      created_at: new Date(item.created_at),
      updated_at: new Date(item.updated_at),
      last_message_at: item.last_message_at ? new Date(item.last_message_at) : null,
      has_unread_operator: item.has_unread_operator,
      has_unread_patient: item.has_unread_patient,
    };

    const record = existing
      ? await prisma.operatorChat.update({ where: { id: existing.id }, data: payload })
      : await prisma.operatorChat.create({ data: payload });

    operatorChatIdByKey.set(item.key, record.id);
  }
  console.log(`  ✓ operator_chats: ${operatorChatIdByKey.size}`);

  for (const item of data.operatorChatMessages) {
    const chat_id = operatorChatIdByKey.get(item.chatKey);
    const sender_id = patientIdByEmail.get(item.senderEmail);
    if (!chat_id || !sender_id) continue;

    const existing = await prisma.operatorChatMessage.findFirst({
      where: {
        chat_id,
        sender_id,
        created_at: new Date(item.created_at),
        content: item.content,
      },
    });

    const payload = {
      chat_id,
      sender_id,
      sender_type: item.sender_type,
      content: item.content,
      created_at: new Date(item.created_at),
      is_read: item.is_read,
    };

    if (existing) {
      await prisma.operatorChatMessage.update({ where: { id: existing.id }, data: payload });
    } else {
      await prisma.operatorChatMessage.create({ data: payload });
    }
  }
  console.log(`  ✓ operator_chat_messages: ${data.operatorChatMessages.length}`);

  for (const item of data.appointments) {
    const patient_id = patientIdByEmail.get(item.patientEmail);
    const specialist_id = specialistIdByKey.get(item.specialistKey);
    if (!patient_id || !specialist_id) continue;

    const service_id = item.serviceKey ? serviceIdByKey.get(item.serviceKey) ?? null : null;

    const existing = await prisma.appointment.findFirst({
      where: {
        patient_id,
        specialist_id,
        scheduled_at: new Date(item.scheduled_at),
      },
    });

    const payload = {
      patient_id,
      specialist_id,
      service_id,
      scheduled_at: new Date(item.scheduled_at),
      duration_minutes: item.duration_minutes,
      status: item.status,
      note: item.note,
      admin_comment: item.admin_comment,
      created_at: new Date(item.created_at),
      updated_at: new Date(item.updated_at),
    };

    if (existing) {
      await prisma.appointment.update({ where: { id: existing.id }, data: payload });
    } else {
      await prisma.appointment.create({ data: payload });
    }
  }
  console.log(`  ✓ appointments: ${data.appointments.length}`);

  console.log('✅ Full import completed');
}
