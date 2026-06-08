import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Отзывы",
};

export default function FeedbacksLayout({ children }: { children: React.ReactNode }) {
  return children;
}
