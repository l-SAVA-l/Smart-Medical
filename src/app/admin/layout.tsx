import { Metadata } from "next";
import { AdminProviders } from "./AdminProviders";

export const metadata: Metadata = {
  title: "Панель администратора",
  description: "Панель администратора медицинского центра Doctor Family. Управление контентом и пользователями.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AdminProviders>{children}</AdminProviders>;
}
