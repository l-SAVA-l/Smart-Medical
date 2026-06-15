export function makeCatalogKey(label: string, categorySlug: string): string {
  const normalized = label.trim().toLowerCase().replace(/\s+/g, ' ');
  return `${normalized}@${categorySlug}`;
}

export function makeQuestionKey(
  question: string,
  serviceKey: string | null,
  questionCategorySlug: string | null
): string {
  const q = question.trim().toLowerCase().slice(0, 120);
  return `${q}@${serviceKey ?? ''}@${questionCategorySlug ?? ''}`;
}

export function makeFeedbackKey(name: string, date: string, text: string): string {
  return `${name.trim().toLowerCase()}@${date}@${text.trim().toLowerCase().slice(0, 80)}`;
}

export function makeMaterialKey(title: string, year: number): string {
  return `${title.trim().toLowerCase()}@${year}`;
}

export function makeVacancyKey(name: string, category: string): string {
  return `${name.trim().toLowerCase()}@${category.trim().toLowerCase()}`;
}

export function makePartnerKey(name: string, categorySlug: string): string {
  return `${name.trim().toLowerCase()}@${categorySlug}`;
}

export function makeLetterKey(patientEmail: string, subject: string, createdAt: string): string {
  return `${patientEmail.toLowerCase()}@${subject.trim().toLowerCase()}@${createdAt}`;
}

export function makeAppointmentKey(
  patientEmail: string,
  specialistKey: string,
  scheduledAt: string
): string {
  return `${patientEmail.toLowerCase()}@${specialistKey}@${scheduledAt}`;
}

export function makeOperatorChatKey(patientEmail: string, createdAt: string): string {
  return `${patientEmail.toLowerCase()}@${createdAt}`;
}

export function makeOperatorChatMessageKey(
  chatKey: string,
  senderEmail: string,
  createdAt: string,
  content: string
): string {
  return `${chatKey}@${senderEmail.toLowerCase()}@${createdAt}@${content.trim().toLowerCase().slice(0, 60)}`;
}

export function makeLetterMessageKey(
  letterKey: string,
  senderType: string,
  createdAt: string,
  content: string
): string {
  return `${letterKey}@${senderType}@${createdAt}@${content.trim().toLowerCase().slice(0, 60)}`;
}
