import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Письма",
};

export default function LettersLayout({ children }: { children: React.ReactNode }) {
  return children;
}
