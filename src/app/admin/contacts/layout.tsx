import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Контакты",
};

export default function ContactsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
