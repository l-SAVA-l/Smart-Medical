import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Материалы",
};

export default function MaterialsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
