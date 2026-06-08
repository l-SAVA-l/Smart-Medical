import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Вопросы",
};

export default function QuestionsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
