import { Metadata } from "next";
import { SMPatientContent } from "@/components/SMPatientPage/SMPatientContent";

export const metadata: Metadata = {
  title: "Пациентам",
  description: "Информация для пациентов медицинского центра Doctor Family. Подготовка к приёму, правила посещения, полезные материалы.",
  keywords: ["пациентам", "Doctor Family", "информация", "подготовка к приёму", "правила"],
  openGraph: {
    title: "Doctor Family | Пациентам",
    description: "Информация для пациентов медицинского центра Doctor Family.",
  },
};

export default function Patient() {
    return (
        <SMPatientContent />
    )
}