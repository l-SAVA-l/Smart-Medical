// Утилиты для управления уведомлениями о письмах в localStorage

const NOTIFIED_LETTERS_KEY = 'letter-notifications-notified';

/**
 * Очистить уведомление о письме (когда пользователь открыл и прочитал письмо)
 */
export function clearLetterNotification(letterId: number): void {
  if (typeof window === 'undefined') return;

  try {
    const notifiedLetters = JSON.parse(
      localStorage.getItem(NOTIFIED_LETTERS_KEY) || '[]'
    ) as number[];

    // Удаляем ID письма и ID+10000 (для thread messages)
    const updated = notifiedLetters.filter(
      (id) => id !== letterId && id !== letterId + 10000
    );

    localStorage.setItem(NOTIFIED_LETTERS_KEY, JSON.stringify(updated));
  } catch (error) {
  }
}

/**
 * Проверить, было ли уже показано уведомление для письма
 */
export function wasLetterNotified(letterId: number, isThreadMessage = false): boolean {
  if (typeof window === 'undefined') return false;

  try {
    const notifiedLetters = JSON.parse(
      localStorage.getItem(NOTIFIED_LETTERS_KEY) || '[]'
    ) as number[];

    const checkId = isThreadMessage ? letterId + 10000 : letterId;
    return notifiedLetters.includes(checkId);
  } catch (error) {
    return false;
  }
}
