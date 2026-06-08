import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Услуги",
  description: "Полный спектр медицинских услуг в клинике Doctor Family. Диагностика, лечение, профилактика и реабилитация.",
  keywords: ["медицинские услуги", "Doctor Family", "лечение", "диагностика", "клиника"],
  openGraph: {
    title: "Doctor Family | Услуги",
    description: "Полный спектр медицинских услуг в клинике Doctor Family. Диагностика, лечение, профилактика.",
  },
};

export default function ServicesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
