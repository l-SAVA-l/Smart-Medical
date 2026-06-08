/**
 * Validation utilities for forms
 */

export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

// Password validation rules
export const PASSWORD_RULES = {
  minLength: 4,
  requireUppercase: true,
  requireSymbol: true,
};

/**
 * Validate password
 * - Minimum 4 characters
 * - At least one uppercase letter
 * - At least one symbol (!@#$%^&*()_+-=[]{}|;':",.<>?/)
 */
export function validatePassword(password: string): ValidationResult {
  if (!password) {
    return { isValid: false, error: 'Пароль обязателен' };
  }

  if (password.length < PASSWORD_RULES.minLength) {
    return { isValid: false, error: `Пароль должен содержать минимум ${PASSWORD_RULES.minLength} символа` };
  }

  if (PASSWORD_RULES.requireUppercase && !/[A-ZА-ЯЁ]/.test(password)) {
    return { isValid: false, error: 'Пароль должен содержать хотя бы одну заглавную букву' };
  }

  if (PASSWORD_RULES.requireSymbol && !/[!@#$%^&*()_+\-=\[\]{}|;':",.<>?\/\\`~]/.test(password)) {
    return { isValid: false, error: 'Пароль должен содержать хотя бы один специальный символ (!@#$%^&* и т.д.)' };
  }

  return { isValid: true };
}

/**
 * Validate name part (first name, last name, middle name)
 * - Minimum 2 characters
 * - No spaces
 * - Only letters (cyrillic and latin)
 * - Capitalizes first letter
 */
export function validateNamePart(name: string, fieldName: string = 'Имя'): ValidationResult {
  if (!name) {
    return { isValid: false, error: `${fieldName} обязательно` };
  }

  const trimmed = name.trim();

  if (trimmed.length < 2) {
    return { isValid: false, error: `${fieldName} должно содержать минимум 2 символа` };
  }

  if (/\s/.test(trimmed)) {
    return { isValid: false, error: `${fieldName} не должно содержать пробелов` };
  }

  if (!/^[a-zA-Zа-яА-ЯёЁ]+$/.test(trimmed)) {
    return { isValid: false, error: `${fieldName} должно содержать только буквы` };
  }

  return { isValid: true };
}

/**
 * Capitalize first letter of a name
 */
export function capitalizeName(name: string): string {
  if (!name) return '';
  const trimmed = name.trim().toLowerCase();
  return trimmed.charAt(0).toUpperCase() + trimmed.slice(1);
}

/**
 * Validate email format
 */
export function validateEmail(email: string): ValidationResult {
  if (!email) {
    return { isValid: false, error: 'Email обязателен' };
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return { isValid: false, error: 'Некорректный формат email' };
  }

  return { isValid: true };
}

/**
 * Validate phone number (Belarus format)
 */
export function validatePhone(phone: string): ValidationResult {
  if (!phone) {
    return { isValid: false, error: 'Телефон обязателен' };
  }

  // Remove all non-digit characters
  const digits = phone.replace(/\D/g, '');

  // Belarus phone: 375 + 9 digits = 12 digits total
  if (digits.length !== 12) {
    return { isValid: false, error: 'Телефон должен быть в формате +375 (XX) XXX-XX-XX' };
  }

  if (!digits.startsWith('375')) {
    return { isValid: false, error: 'Телефон должен начинаться с +375' };
  }

  return { isValid: true };
}

/**
 * Validate login
 * - Minimum 3 characters
 * - Only letters, numbers, underscores
 * - No spaces
 */
export function validateLogin(login: string): ValidationResult {
  if (!login) {
    return { isValid: false, error: 'Логин обязателен' };
  }

  const trimmed = login.trim();

  if (trimmed.length < 3) {
    return { isValid: false, error: 'Логин должен содержать минимум 3 символа' };
  }

  if (/\s/.test(trimmed)) {
    return { isValid: false, error: 'Логин не должен содержать пробелов' };
  }

  if (!/^[a-zA-Z0-9_]+$/.test(trimmed)) {
    return { isValid: false, error: 'Логин может содержать только латинские буквы, цифры и _' };
  }

  return { isValid: true };
}

/**
 * Validate text field (subject, message)
 */
export function validateTextField(text: string, fieldName: string, minLength: number = 3, maxLength: number = 1000): ValidationResult {
  if (!text) {
    return { isValid: false, error: `${fieldName} обязательно` };
  }

  const trimmed = text.trim();

  if (trimmed.length < minLength) {
    return { isValid: false, error: `${fieldName} должно содержать минимум ${minLength} символа` };
  }

  if (trimmed.length > maxLength) {
    return { isValid: false, error: `${fieldName} не должно превышать ${maxLength} символов` };
  }

  return { isValid: true };
}

/**
 * Validate review/feedback
 */
export function validateFeedback(data: { name: string; text: string; grade: number }): ValidationResult {
  // Validate name
  const nameResult = validateTextField(data.name, 'Имя', 2, 100);
  if (!nameResult.isValid) return nameResult;

  // Check name doesn't have numbers
  if (/\d/.test(data.name)) {
    return { isValid: false, error: 'Имя не должно содержать цифры' };
  }

  // Validate text
  const textResult = validateTextField(data.text, 'Текст отзыва', 10, 2000);
  if (!textResult.isValid) return textResult;

  // Validate grade
  if (data.grade < 1 || data.grade > 5) {
    return { isValid: false, error: 'Оценка должна быть от 1 до 5' };
  }

  return { isValid: true };
}

/**
 * Validate letter to chief doctor
 */
export function validateLetter(data: { subject: string; content: string }): ValidationResult {
  // Validate subject
  const subjectResult = validateTextField(data.subject, 'Тема письма', 3, 200);
  if (!subjectResult.isValid) return subjectResult;

  // Validate content
  const contentResult = validateTextField(data.content, 'Сообщение', 10, 5000);
  if (!contentResult.isValid) return contentResult;

  return { isValid: true };
}
