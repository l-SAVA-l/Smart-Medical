module.exports = [
"[externals]/next/dist/compiled/next-server/app-route-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-route-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-route-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-route-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[externals]/next/dist/compiled/@opentelemetry/api [external] (next/dist/compiled/@opentelemetry/api, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/@opentelemetry/api", () => require("next/dist/compiled/@opentelemetry/api"));

module.exports = mod;
}),
"[externals]/next/dist/compiled/next-server/app-page-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-page-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-unit-async-storage.external.js [external] (next/dist/server/app-render/work-unit-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/work-unit-async-storage.external.js", () => require("next/dist/server/app-render/work-unit-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-async-storage.external.js [external] (next/dist/server/app-render/work-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/work-async-storage.external.js", () => require("next/dist/server/app-render/work-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/shared/lib/no-fallback-error.external.js [external] (next/dist/shared/lib/no-fallback-error.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/shared/lib/no-fallback-error.external.js", () => require("next/dist/shared/lib/no-fallback-error.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/after-task-async-storage.external.js [external] (next/dist/server/app-render/after-task-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/after-task-async-storage.external.js", () => require("next/dist/server/app-render/after-task-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/@prisma/client [external] (@prisma/client, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("@prisma/client", () => require("@prisma/client"));

module.exports = mod;
}),
"[project]/src/lib/prisma.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "prisma",
    ()=>prisma
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f40$prisma$2f$client__$5b$external$5d$__$2840$prisma$2f$client$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/@prisma/client [external] (@prisma/client, cjs)");
;
const globalForPrisma = globalThis;
const prisma = globalForPrisma.prisma ?? new __TURBOPACK__imported__module__$5b$externals$5d2f40$prisma$2f$client__$5b$external$5d$__$2840$prisma$2f$client$2c$__cjs$29$__["PrismaClient"]({
    log: ("TURBOPACK compile-time truthy", 1) ? [
        'query',
        'error',
        'warn'
    ] : "TURBOPACK unreachable"
});
if ("TURBOPACK compile-time truthy", 1) globalForPrisma.prisma = prisma;
}),
"[externals]/buffer [external] (buffer, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("buffer", () => require("buffer"));

module.exports = mod;
}),
"[externals]/crypto [external] (crypto, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("crypto", () => require("crypto"));

module.exports = mod;
}),
"[externals]/util [external] (util, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("util", () => require("util"));

module.exports = mod;
}),
"[externals]/zlib [external] (zlib, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("zlib", () => require("zlib"));

module.exports = mod;
}),
"[externals]/http [external] (http, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("http", () => require("http"));

module.exports = mod;
}),
"[externals]/https [external] (https, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("https", () => require("https"));

module.exports = mod;
}),
"[externals]/events [external] (events, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("events", () => require("events"));

module.exports = mod;
}),
"[project]/src/utils/auth.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

// Утилиты для работы с ролями и правами доступа
__turbopack_context__.s([
    "ADMIN_ROLES",
    ()=>ADMIN_ROLES,
    "canManageAdmins",
    ()=>canManageAdmins,
    "getRoleName",
    ()=>getRoleName,
    "hasAdminAccess",
    ()=>hasAdminAccess,
    "hasFullAdminAccess",
    ()=>hasFullAdminAccess,
    "isAdmin",
    ()=>isAdmin,
    "isChatOnlyAccess",
    ()=>isChatOnlyAccess,
    "isChiefDoctor",
    ()=>isChiefDoctor,
    "isOperator",
    ()=>isOperator
]);
const ADMIN_ROLES = [
    "ADMIN",
    "CHIEF_DOCTOR",
    "OPERATOR"
];
function hasAdminAccess(role) {
    if (!role) return false;
    return ADMIN_ROLES.includes(role);
}
function hasFullAdminAccess(role) {
    if (!role) return false;
    return role === "ADMIN" || role === "CHIEF_DOCTOR";
}
function canManageAdmins(role) {
    return role === "CHIEF_DOCTOR";
}
function isChatOnlyAccess(role) {
    return role === "OPERATOR";
}
function isAdmin(role) {
    return role === "ADMIN";
}
function isChiefDoctor(role) {
    return role === "CHIEF_DOCTOR";
}
function isOperator(role) {
    return role === "OPERATOR";
}
function getRoleName(role) {
    switch(role){
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
}),
"[project]/src/utils/api-auth.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "checkAdminAccess",
    ()=>checkAdminAccess,
    "checkAdminManagementAccess",
    ()=>checkAdminManagementAccess,
    "checkChatAccess",
    ()=>checkChatAccess,
    "checkFullAdminAccess",
    ()=>checkFullAdminAccess
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2d$auth$2f$jwt$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next-auth/jwt/index.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$utils$2f$auth$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/utils/auth.ts [app-route] (ecmascript)");
;
;
async function checkAdminAccess(request) {
    try {
        // Получаем токен из сессии
        const token = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2d$auth$2f$jwt$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getToken"])({
            req: request,
            secret: process.env.NEXTAUTH_SECRET
        });
        // Проверяем наличие токена и ID пользователя
        if (!token || !token.id) {
            return {
                isAdmin: false,
                error: "Не авторизован"
            };
        }
        // Проверяем роль пользователя
        const userRole = token.role;
        if (!(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$utils$2f$auth$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["hasAdminAccess"])(userRole)) {
            return {
                isAdmin: false,
                error: "Нет прав доступа"
            };
        }
        return {
            isAdmin: true,
            userId: parseInt(token.id),
            role: userRole,
            hasFullAccess: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$utils$2f$auth$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["hasFullAdminAccess"])(userRole),
            canManageAdmins: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$utils$2f$auth$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["canManageAdmins"])(userRole)
        };
    } catch (error) {
        return {
            isAdmin: false,
            error: "Ошибка при проверке прав доступа"
        };
    }
}
async function checkFullAdminAccess(request) {
    const result = await checkAdminAccess(request);
    if (!result.isAdmin) {
        return result;
    }
    if (!result.hasFullAccess) {
        return {
            isAdmin: false,
            error: "Недостаточно прав доступа"
        };
    }
    return result;
}
async function checkChatAccess(request) {
    // Для чата достаточно базового админского доступа (включая операторов)
    return checkAdminAccess(request);
}
async function checkAdminManagementAccess(request) {
    const result = await checkAdminAccess(request);
    if (!result.isAdmin) {
        return result;
    }
    if (!result.canManageAdmins) {
        return {
            isAdmin: false,
            error: "Доступ только для главного врача"
        };
    }
    return result;
}
}),
"[project]/src/app/api/admin/specialists/route.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "GET",
    ()=>GET,
    "POST",
    ()=>POST
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/server.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/prisma.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$utils$2f$api$2d$auth$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/utils/api-auth.ts [app-route] (ecmascript)");
;
;
;
async function GET(request) {
    try {
        const adminCheck = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$utils$2f$api$2d$auth$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["checkFullAdminAccess"])(request);
        if (!adminCheck.isAdmin) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: adminCheck.error
            }, {
                status: 403
            });
        }
        const specialists = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].specialist.findMany({
            include: {
                serviceCategory: {
                    select: {
                        id: true,
                        name: true,
                        slug: true
                    }
                }
            },
            orderBy: {
                id: "desc"
            }
        });
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json(specialists);
    } catch (error) {
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            error: "Ошибка при получении специалистов"
        }, {
            status: 500
        });
    }
}
async function POST(request) {
    try {
        const adminCheck = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$utils$2f$api$2d$auth$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["checkFullAdminAccess"])(request);
        if (!adminCheck.isAdmin) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: adminCheck.error
            }, {
                status: 403
            });
        }
        const data = await request.json();
        console.log('Creating specialist with data:', {
            ...data,
            service_category_id: data.service_category_id ? parseInt(data.service_category_id) : null
        });
        const specialist = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].specialist.create({
            data: {
                name: data.name,
                specialization: data.specialization,
                qualification: data.qualification,
                experience: parseInt(data.experience),
                grade: parseInt(data.grade),
                image_url: data.image_url || "/images/default-doctor.jpg",
                activity_area: data.activity_area || null,
                education_details: data.education_details || null,
                conferences: data.conferences || [],
                specializations: data.specializations || [],
                education: data.education || [],
                work_examples: data.work_examples || null,
                service_category_id: data.service_category_id ? parseInt(data.service_category_id) : null
            },
            include: {
                serviceCategory: true
            }
        });
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json(specialist, {
            status: 201
        });
    } catch (error) {
        console.error('Error creating specialist:', error);
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            error: "Ошибка при создании специалиста",
            details: error instanceof Error ? error.message : 'Unknown error'
        }, {
            status: 500
        });
    }
}
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__60e76957._.js.map