import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const locations = await prisma.location.findMany({
    select: { county: true, town: true, estate: true },
    orderBy: [{ county: "asc" }, { town: "asc" }, { estate: "asc" }],
  });
  return NextResponse.json({ data: locations });
}