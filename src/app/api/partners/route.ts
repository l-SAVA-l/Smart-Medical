import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const categorySlug = searchParams.get("category");

    let partners;

    if (categorySlug) {
      // Get partners by category slug
      partners = await prisma.partner.findMany({
        where: {
          category: {
            slug: categorySlug
          }
        },
        include: {
          category: {
            select: {
              name: true,
              slug: true
            }
          }
        },
        orderBy: {
          number: 'asc'
        }
      });
    } else {
      // Get all partners
      partners = await prisma.partner.findMany({
        include: {
          category: {
            select: {
              name: true,
              slug: true
            }
          }
        },
        orderBy: {
          number: 'asc'
        }
      });
    }

    return NextResponse.json(partners, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch partners" },
      { status: 500 }
    );
  }
}
