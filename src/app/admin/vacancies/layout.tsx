import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Вакансии",
};

export default function VacanciesLayout({ children }: { children: React.ReactNode }) {
  return children;
}
