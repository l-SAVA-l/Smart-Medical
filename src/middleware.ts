import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";
import { hasAdminAccess, hasFullAdminAccess, isChatOnlyAccess } from "@/utils/auth";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Защищаем роуты /admin
  if (pathname.startsWith("/admin")) {
    const token = await getToken({
      req: request,
      secret: process.env.NEXTAUTH_SECRET,
    });

    // Если пользователь не авторизован или не имеет нужной роли - редирект на главную
    if (!token || !hasAdminAccess(token.role)) {
      const url = request.nextUrl.clone();
      url.pathname = "/";
      return NextResponse.redirect(url);
    }

    // Если пользователь - оператор (только доступ к чату)
    if (isChatOnlyAccess(token.role)) {
      // Разрешаем доступ только к /admin и /admin/chat
      if (pathname === "/admin" || pathname.startsWith("/admin/chat")) {
        return NextResponse.next();
      }

      // Для всех остальных роутов - редирект на чат
      const url = request.nextUrl.clone();
      url.pathname = "/admin/chat";
      return NextResponse.redirect(url);
    }

    // Для администраторов и главного врача - полный доступ
    if (hasFullAdminAccess(token.role)) {
      return NextResponse.next();
    }
  }

  return NextResponse.next();
}

// Настройка matcher для применения middleware только к нужным путям
export const config = {
  matcher: [
    // Применяем middleware к роутам админ-панели
    "/admin/:path*",
  ],
};
