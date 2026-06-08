import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Записи на приём",
};

export default function AppointmentsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
