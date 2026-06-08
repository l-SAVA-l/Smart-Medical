export const APPOINTMENT_STATUS_OPTIONS = [
  {
    value: "pending",
    label: "Ожидает подтверждения",
    color: "bg-amber-100 text-amber-800 border border-amber-200",
    accent: "border-l-amber-500",
    cardTint: "bg-gradient-to-br from-amber-50/80 to-white",
  },
  {
    value: "confirmed",
    label: "Подтверждена",
    color: "bg-green-100 text-green-800 border border-green-200",
    accent: "border-l-[#18A36C]",
    cardTint: "bg-gradient-to-br from-green-50/80 to-white",
  },
  {
    value: "cancelled",
    label: "Отменена",
    color: "bg-gray-100 text-gray-600 border border-gray-200",
    accent: "border-l-gray-400",
    cardTint: "bg-gradient-to-br from-gray-50 to-white",
  },
  {
    value: "completed",
    label: "Завершена",
    color: "bg-blue-100 text-blue-800 border border-blue-200",
    accent: "border-l-blue-500",
    cardTint: "bg-gradient-to-br from-blue-50/80 to-white",
  },
  {
    value: "no_show",
    label: "Не явился",
    color: "bg-red-100 text-red-800 border border-red-200",
    accent: "border-l-red-500",
    cardTint: "bg-gradient-to-br from-red-50/80 to-white",
  },
] as const;

export function getStatusLabel(status: string): string {
  return APPOINTMENT_STATUS_OPTIONS.find((s) => s.value === status)?.label ?? status;
}

export function getStatusColor(status: string): string {
  return APPOINTMENT_STATUS_OPTIONS.find((s) => s.value === status)?.color ?? "bg-gray-100 text-gray-700";
}

export function getStatusAccent(status: string): string {
  return APPOINTMENT_STATUS_OPTIONS.find((s) => s.value === status)?.accent ?? "border-l-gray-300";
}

export function getStatusCardTint(status: string): string {
  return APPOINTMENT_STATUS_OPTIONS.find((s) => s.value === status)?.cardTint ?? "bg-white";
}

export function canPatientCancel(status: string): boolean {
  return status === "pending" || status === "confirmed";
}
