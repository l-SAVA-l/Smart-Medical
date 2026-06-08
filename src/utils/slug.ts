/**
 * Утилиты для генерации slug из строк
 */

// Таблица транслитерации для русских символов
const translitMap: Record<string, string> = {
  а: 'a', б: 'b', в: 'v', г: 'g', д: 'd', е: 'e', ё: 'yo', ж: 'zh', з: 'z',
  и: 'i', й: 'y', к: 'k', л: 'l', м: 'm', н: 'n', о: 'o', п: 'p', р: 'r',
  с: 's', т: 't', у: 'u', ф: 'f', х: 'h', ц: 'ts', ч: 'ch', ш: 'sh', щ: 'sch',
  ъ: '', ы: 'y', ь: '', э: 'e', ю: 'yu', я: 'ya',
  А: 'A', Б: 'B', В: 'V', Г: 'G', Д: 'D', Е: 'E', Ё: 'Yo', Ж: 'Zh', З: 'Z',
  И: 'I', Й: 'Y', К: 'K', Л: 'L', М: 'M', Н: 'N', О: 'O', П: 'P', Р: 'R',
  С: 'S', Т: 'T', У: 'U', Ф: 'F', Х: 'H', Ц: 'Ts', Ч: 'Ch', Ш: 'Sh', Щ: 'Sch',
  Ъ: '', Ы: 'Y', Ь: '', Э: 'E', Ю: 'Yu', Я: 'Ya'
};

/**
 * Транслитерирует русский текст в латиницу
 */
function transliterate(text: string): string {
  return text
    .split('')
    .map(char => translitMap[char] || char)
    .join('');
}

/**
 * Генерирует slug из строки
 * - Транслитерирует русские символы
 * - Приводит к нижнему регистру
 * - Заменяет пробелы и специальные символы на дефис
 * - Удаляет множественные дефисы
 * - Удаляет дефисы в начале и конце
 *
 * @param text Исходный текст
 * @returns Сгенерированный slug
 *
 * @example
 * generateSlug('Детская стоматология') // 'detskaya-stomatologiya'
 * generateSlug('УЗИ & Диагностика') // 'uzi-diagnostika'
 * generateSlug('  Хирургия   ') // 'hirurgiya'
 */
export function generateSlug(text: string): string {
  if (!text) return '';

  return transliterate(text)
    .toLowerCase()
    .trim()
    // Заменяем пробелы и специальные символы на дефис
    .replace(/[\s_]+/g, '-')
    // Удаляем все, кроме букв, цифр и дефисов
    .replace(/[^a-z0-9-]/g, '')
    // Удаляем множественные дефисы
    .replace(/-+/g, '-')
    // Удаляем дефисы в начале и конце
    .replace(/^-+|-+$/g, '');
}

/**
 * Проверяет, является ли строка валидным slug
 *
 * @param slug Строка для проверки
 * @returns true если slug валиден
 */
export function isValidSlug(slug: string): boolean {
  // Slug должен содержать только строчные буквы, цифры и дефисы
  // Не должен начинаться или заканчиваться дефисом
  // Не должен содержать множественные дефисы подряд
  return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug);
}

/**
 * Создает уникальный slug, добавляя числовой суффикс если необходимо
 *
 * @param baseSlug Базовый slug
 * @param existingSlugs Массив существующих slug
 * @returns Уникальный slug
 *
 * @example
 * makeUniqueSlug('pediatriya', ['pediatriya']) // 'pediatriya-2'
 * makeUniqueSlug('pediatriya', ['pediatriya', 'pediatriya-2']) // 'pediatriya-3'
 */
export function makeUniqueSlug(baseSlug: string, existingSlugs: string[]): string {
  if (!existingSlugs.includes(baseSlug)) {
    return baseSlug;
  }

  let counter = 2;
  let newSlug = `${baseSlug}-${counter}`;

  while (existingSlugs.includes(newSlug)) {
    counter++;
    newSlug = `${baseSlug}-${counter}`;
  }

  return newSlug;
}
