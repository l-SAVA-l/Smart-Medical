import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Личный кабинет",
  description: "Личный кабинет пациента Doctor Family. Управление записями, история посещений, медицинские документы.",
  keywords: ["личный кабинет", "Doctor Family", "пациент", "записи", "история"],
  openGraph: {
    title: "Doctor Family | Личный кабинет",
    description: "Личный кабинет пациента Doctor Family. Управление записями и медицинскими документами.",
  },
};

export default function AccountLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
