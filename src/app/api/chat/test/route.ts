import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const results: any = {
    timestamp: new Date().toISOString(),
    openrouterKey: process.env.OPENROUTER_API_KEY ? "✓ Configured" : "✗ Missing",
    database: {
      connection: "unknown",
      contacts: 0,
      services: 0,
      specialists: 0,
    },
    specialistsList: [],
    servicesList: [],
  };

  // Test Prisma connection
  try {
    await prisma.$connect();
    results.database.connection = "✓ Connected";

    // Test contacts
    const contactsCount = await prisma.contacts.count();
    results.database.contacts = contactsCount;

    // Test services
    const servicesCount = await prisma.service.count();
    results.database.services = servicesCount;

    // Test specialists
    const specialistsCount = await prisma.specialist.count();
    results.database.specialists = specialistsCount;

    // Get actual specialists with IDs
    const specialists = await prisma.specialist.findMany({
      select: { id: true, name: true, qualification: true, specialization: true },
    });
    results.specialistsList = specialists;

    // Get actual services with IDs (first 15)
    const services = await prisma.service.findMany({
      select: { id: true, title: true },
      take: 15,
    });
    results.servicesList = services;

  } catch (error) {
    results.database.connection = "✗ Failed";
    results.database.error = error instanceof Error ? error.message : "Unknown error";
  }

  return NextResponse.json(results, { status: 200 });
}
