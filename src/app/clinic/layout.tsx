import { Metadata } from "next";

export const metadata: Metadata = {
  title: "О клинике",
  description: "Медицинский центр Doctor Family - современная клиника с передовым оборудованием и комфортными условиями для пациентов.",
  keywords: ["клиника", "Doctor Family", "медицинский центр", "о нас", "оборудование"],
  openGraph: {
    title: "Doctor Family | О клинике",
    description: "Медицинский центр Doctor Family - современная клиника с передовым оборудованием.",
  },
};

export default function ClinicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
