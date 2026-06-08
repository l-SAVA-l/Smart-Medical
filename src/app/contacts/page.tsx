import { Metadata } from "next";
import { SMContactsPage } from "@/components/SMContactsPage/SMContactsPage";

export const metadata: Metadata = {
  title: "Контакты",
  description: "Контакты медицинского центра Doctor Family. Адрес, телефон, режим работы и форма обратной связи.",
  keywords: ["контакты", "Doctor Family", "адрес", "телефон", "как добраться"],
  openGraph: {
    title: "Doctor Family | Контакты",
    description: "Контакты медицинского центра Doctor Family. Адрес, телефон, режим работы.",
  },
};

export default function Contacts() {
    return (
        <SMContactsPage />
    )
}