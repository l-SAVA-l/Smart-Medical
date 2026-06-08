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
"[project]/src/lib/appointments.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "APPOINTMENT_STATUSES",
    ()=>APPOINTMENT_STATUSES,
    "DEFAULT_DURATION_MINUTES",
    ()=>DEFAULT_DURATION_MINUTES,
    "OCCUPYING_STATUSES",
    ()=>OCCUPYING_STATUSES,
    "SLOT_STEP_MINUTES",
    ()=>SLOT_STEP_MINUTES,
    "STATUS_LABELS",
    ()=>STATUS_LABELS,
    "WORK_END_HOUR",
    ()=>WORK_END_HOUR,
    "WORK_START_HOUR",
    ()=>WORK_START_HOUR,
    "canPatientCancel",
    ()=>canPatientCancel,
    "findConflictingAppointment",
    ()=>findConflictingAppointment,
    "formatAppointmentForClient",
    ()=>formatAppointmentForClient,
    "generateDaySlots",
    ()=>generateDaySlots,
    "getAppointmentEnd",
    ()=>getAppointmentEnd,
    "rangesOverlap",
    ()=>rangesOverlap,
    "specialistProvidesService",
    ()=>specialistProvidesService,
    "validateScheduledInFuture",
    ()=>validateScheduledInFuture,
    "validateWorkingHours",
    ()=>validateWorkingHours
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/prisma.ts [app-route] (ecmascript)");
;
const APPOINTMENT_STATUSES = [
    "pending",
    "confirmed",
    "cancelled",
    "completed",
    "no_show"
];
const OCCUPYING_STATUSES = [
    "pending",
    "confirmed",
    "completed",
    "no_show"
];
const DEFAULT_DURATION_MINUTES = 30;
const WORK_START_HOUR = 8;
const WORK_END_HOUR = 20;
const SLOT_STEP_MINUTES = 30;
function getAppointmentEnd(scheduledAt, durationMinutes) {
    return new Date(scheduledAt.getTime() + durationMinutes * 60_000);
}
function rangesOverlap(startA, endA, startB, endB) {
    return startA < endB && startB < endA;
}
async function specialistProvidesService(specialistId, serviceId) {
    const link = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].serviceSpecialist.findUnique({
        where: {
            service_id_specialist_id: {
                service_id: serviceId,
                specialist_id: specialistId
            }
        }
    });
    return Boolean(link);
}
async function findConflictingAppointment(specialistId, scheduledAt, durationMinutes, excludeAppointmentId) {
    const end = getAppointmentEnd(scheduledAt, durationMinutes);
    const existing = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].appointment.findMany({
        where: {
            specialist_id: specialistId,
            status: {
                in: OCCUPYING_STATUSES
            },
            ...excludeAppointmentId ? {
                id: {
                    not: excludeAppointmentId
                }
            } : {}
        },
        select: {
            id: true,
            scheduled_at: true,
            duration_minutes: true
        }
    });
    return existing.find((apt)=>{
        const aptEnd = getAppointmentEnd(apt.scheduled_at, apt.duration_minutes);
        return rangesOverlap(scheduledAt, end, apt.scheduled_at, aptEnd);
    }) ?? null;
}
function validateScheduledInFuture(scheduledAt) {
    const now = new Date();
    if (scheduledAt.getTime() <= now.getTime()) {
        return "Запись возможна только на будущее время";
    }
    return null;
}
function validateWorkingHours(scheduledAt) {
    const hours = scheduledAt.getHours();
    const minutes = scheduledAt.getMinutes();
    if (hours < WORK_START_HOUR || hours >= WORK_END_HOUR) {
        return `Приём с ${WORK_START_HOUR}:00 до ${WORK_END_HOUR}:00`;
    }
    if (minutes % SLOT_STEP_MINUTES !== 0) {
        return `Время должно быть кратно ${SLOT_STEP_MINUTES} минутам`;
    }
    const end = getAppointmentEnd(scheduledAt, DEFAULT_DURATION_MINUTES);
    if (end.getHours() > WORK_END_HOUR || end.getHours() === WORK_END_HOUR && end.getMinutes() > 0) {
        return "Приём не может заканчиваться после рабочего времени";
    }
    return null;
}
function generateDaySlots(dateStr) {
    const [y, m, d] = dateStr.split("-").map(Number);
    const slots = [];
    for(let hour = WORK_START_HOUR; hour < WORK_END_HOUR; hour++){
        for(let min = 0; min < 60; min += SLOT_STEP_MINUTES){
            const dt = new Date(y, m - 1, d, hour, min, 0, 0);
            const end = getAppointmentEnd(dt, DEFAULT_DURATION_MINUTES);
            if (end.getHours() > WORK_END_HOUR || end.getHours() === WORK_END_HOUR && end.getMinutes() > 0) {
                continue;
            }
            slots.push(`${String(hour).padStart(2, "0")}:${String(min).padStart(2, "0")}`);
        }
    }
    return slots;
}
function formatAppointmentForClient(a) {
    return {
        id: a.id,
        scheduled_at: a.scheduled_at,
        duration_minutes: a.duration_minutes,
        status: a.status,
        note: a.note,
        admin_comment: a.admin_comment,
        specialist: {
            id: a.specialist.id,
            name: a.specialist.name,
            specialization: a.specialist.specialization
        },
        service: a.service
    };
}
const STATUS_LABELS = {
    pending: "Ожидает подтверждения",
    confirmed: "Подтверждена",
    cancelled: "Отменена",
    completed: "Завершена",
    no_show: "Не явился"
};
function canPatientCancel(status) {
    return status === "pending" || status === "confirmed";
}
}),
"[project]/src/app/api/appointments/availability/route.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "GET",
    ()=>GET
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/server.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/prisma.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$appointments$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/appointments.ts [app-route] (ecmascript)");
;
;
;
async function GET(request) {
    try {
        const { searchParams } = request.nextUrl;
        const specialistId = parseInt(searchParams.get("specialistId") || "", 10);
        const date = searchParams.get("date") || "";
        if (!specialistId || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: "Укажите specialistId и date (YYYY-MM-DD)"
            }, {
                status: 400
            });
        }
        const specialist = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].specialist.findUnique({
            where: {
                id: specialistId
            },
            select: {
                id: true
            }
        });
        if (!specialist) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: "Врач не найден"
            }, {
                status: 404
            });
        }
        const [y, m, d] = date.split("-").map(Number);
        const dayStart = new Date(y, m - 1, d, 0, 0, 0, 0);
        const dayEnd = new Date(y, m - 1, d, 23, 59, 59, 999);
        const appointments = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].appointment.findMany({
            where: {
                specialist_id: specialistId,
                status: {
                    in: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$appointments$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["OCCUPYING_STATUSES"]
                },
                scheduled_at: {
                    gte: dayStart,
                    lte: dayEnd
                }
            },
            select: {
                scheduled_at: true,
                duration_minutes: true
            }
        });
        const allSlots = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$appointments$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["generateDaySlots"])(date);
        const now = new Date();
        const bookedTimes = appointments.map((a)=>{
            const end = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$appointments$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getAppointmentEnd"])(a.scheduled_at, a.duration_minutes);
            return {
                start: a.scheduled_at.toISOString(),
                end: end.toISOString()
            };
        });
        const availableSlots = allSlots.filter((time)=>{
            const [hh, mm] = time.split(":").map(Number);
            const slotStart = new Date(y, m - 1, d, hh, mm, 0, 0);
            if (slotStart.getTime() <= now.getTime()) return false;
            const slotEnd = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$appointments$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getAppointmentEnd"])(slotStart, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$appointments$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["DEFAULT_DURATION_MINUTES"]);
            const occupied = appointments.some((apt)=>{
                const aptEnd = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$appointments$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getAppointmentEnd"])(apt.scheduled_at, apt.duration_minutes);
                return slotStart < aptEnd && apt.scheduled_at < slotEnd;
            });
            return !occupied;
        });
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            date,
            specialistId,
            availableSlots,
            bookedTimes,
            workHours: {
                start: 8,
                end: 20,
                stepMinutes: 30
            }
        });
    } catch (error) {
        console.error("Availability GET error:", error);
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            error: "Ошибка загрузки слотов"
        }, {
            status: 500
        });
    }
}
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__d96a2b54._.js.map