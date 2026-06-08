// Утилиты для работы с ролями и правами доступа

export type UserRole = "USER" | "ADMIN" | "CHIEF_DOCTOR" | "OPERATOR";

// Роли с доступом к админ-панели
export const ADMIN_ROLES: UserRole[] = ["ADMIN", "CHIEF_DOCTOR", "OPERATOR"];

/**
 * Проверяет, имеет ли пользователь доступ к админ-панели
 * @param role Роль пользователя
 * @returns true если пользователь имеет доступ к админ-панели
 */
export function hasAdminAccess(role?: UserRole | string | null): boolean {
  if (!role) return false;
  return ADMIN_ROLES.includes(role as UserRole);
}

/**
 * Проверяет, имеет ли пользователь полный доступ к админ-панели
 * (все разделы кроме управления администраторами)
 * @param role Роль пользователя
 * @returns true если администратор или главный врач
 */
export function hasFullAdminAccess(role?: UserRole | string | null): boolean {
  if (!role) return false;
  return role === "ADMIN" || role === "CHIEF_DOCTOR";
}

/**
 * Проверяет, может ли пользователь управлять администраторами
 * (назначать/снимать роль администратора)
 * @param role Роль пользователя
 * @returns true только для главного врача
 */
export function canManageAdmins(role?: UserRole | string | null): boolean {
  return role === "CHIEF_DOCTOR";
}

/**
 * Проверяет, имеет ли пользователь доступ только к чату
 * @param role Роль пользователя
 * @returns true если оператор
 */
export function isChatOnlyAccess(role?: UserRole | string | null): boolean {
  return role === "OPERATOR";
}

/**
 * Проверяет, является ли пользователь администратором
 * @param role Роль пользователя
 * @returns true если пользователь - администратор
 */
export function isAdmin(role?: UserRole | string | null): boolean {
  return role === "ADMIN";
}

/**
 * Проверяет, является ли пользователь главным врачом
 * @param role Роль пользователя
 * @returns true если пользователь - главный врач
 */
export function isChiefDoctor(role?: UserRole | string | null): boolean {
  return role === "CHIEF_DOCTOR";
}

/**
 * Проверяет, является ли пользователь оператором
 * @param role Роль пользователя
 * @returns true если пользователь - оператор
 */
export function isOperator(role?: UserRole | string | null): boolean {
  return role === "OPERATOR";
}

/**
 * Получает человекочитаемое название роли
 * @param role Роль пользователя
 * @returns Название роли на русском языке
 */
export function getRoleName(role?: UserRole | string | null): string {
  switch (role) {
    case "ADMIN":
      return "Администратор";
    case "CHIEF_DOCTOR":
      return "Главный врач";
    case "OPERATOR":
      return "Оператор";
    case "USER":
      return "Пользователь";
    default:
      return "Неизвестная роль";
  }
}
