import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const contacts = await prisma.contacts.findFirst();

    if (!contacts) {
      return NextResponse.json(
        {
          address: "",
          map_geo: "",
          work_hours_main: "Пн–Сб 09:00–20:00",
          work_hours_sunday: "Вс 10:00–18:00",
          phone_number: "",
          phone_number_sec: null,
          email: "",
        },
        { status: 200 }
      );
    }

    return NextResponse.json(contacts, { status: 200 });
  } catch (error) {
    console.error("Contacts API error:", error);
    return NextResponse.json(
      {
        address: "",
        map_geo: "",
        work_hours_main: "Пн–Сб 09:00–20:00",
        work_hours_sunday: "Вс 10:00–18:00",
        phone_number: "",
        phone_number_sec: null,
        email: "",
      },
      { status: 200 }
    );
  }
}
