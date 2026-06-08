import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Наши врачи",
  description: "Квалифицированные врачи медицинского центра Doctor Family. Специалисты с многолетним опытом работы в различных областях медицины.",
  keywords: ["врачи", "специалисты", "Doctor Family", "медицинский персонал", "доктора"],
  openGraph: {
    title: "Doctor Family | Наши врачи",
    description: "Квалифицированные врачи медицинского центра Doctor Family. Специалисты с многолетним опытом работы.",
  },
};

export default function DoctorsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
