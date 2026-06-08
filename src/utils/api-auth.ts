import { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";
import { hasAdminAccess, hasFullAdminAccess, canManageAdmins, UserRole } from "./auth";

/**
 * Результат проверки прав доступа к API
 */
export interface AdminCheckResult {
  isAdmin: boolean;
  error?: string;
  userId?: number;
  role?: UserRole;
  hasFullAccess?: boolean;
  canManageAdmins?: boolean;
}

/**
 * Проверяет права доступа пользователя к админским API роутам
 * @param request NextRequest объект
 * @returns Результат проверки с информацией о пользователе
 */
export async function checkAdminAccess(
  request: NextRequest
): Promise<AdminCheckResult> {
  try {
    // Получаем токен из сессии
    const token = await getToken({
      req: request,
      secret: process.env.NEXTAUTH_SECRET,
    });

    // Проверяем наличие токена и ID пользователя
    if (!token || !token.id) {
      return {
        isAdmin: false,
        error: "Не авторизован",
      };
    }

    // Проверяем роль пользователя
    const userRole = token.role as UserRole | undefined;
    if (!hasAdminAccess(userRole)) {
      return {
        isAdmin: false,
        error: "Нет прав доступа",
      };
    }

    return {
      isAdmin: true,
      userId: parseInt(token.id as string),
      role: userRole,
      hasFullAccess: hasFullAdminAccess(userRole),
      canManageAdmins: canManageAdmins(userRole),
    };
  } catch (error) {
    return {
      isAdmin: false,
      error: "Ошибка при проверке прав доступа",
    };
  }
}

/**
 * Проверяет полный доступ к админ-панели (не оператор)
 * Используется для всех разделов кроме чата
 */
export async function checkFullAdminAccess(
  request: NextRequest
): Promise<AdminCheckResult> {
  const result = await checkAdminAccess(request);

  if (!result.isAdmin) {
    return result;
  }

  if (!result.hasFullAccess) {
    return {
      isAdmin: false,
      error: "Недостаточно прав доступа",
    };
  }

  return result;
}

/**
 * Проверяет права на управление чатами (операторы, администраторы, главный врач)
 * Используется для API чата
 */
export async function checkChatAccess(
  request: NextRequest
): Promise<AdminCheckResult> {
  // Для чата достаточно базового админского доступа (включая операторов)
  return checkAdminAccess(request);
}

/**
 * Проверяет права на управление администраторами
 * Используется для назначения/снятия роли администратора
 * Доступно только главному врачу
 */
export async function checkAdminManagementAccess(
  request: NextRequest
): Promise<AdminCheckResult> {
  const result = await checkAdminAccess(request);

  if (!result.isAdmin) {
    return result;
  }

  if (!result.canManageAdmins) {
    return {
      isAdmin: false,
      error: "Доступ только для главного врача",
    };
  }

  return result;
}
