import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const searchSchema = z.object({ label: z.string().trim().min(1), q: z.string().default(""), county: z.string().default(""), town: z.string().default(""), estate: z.string().default(""), type: z.string().default(""), propertyType: z.string().default(""), minPrice: z.coerce.number().int().nonnegative().optional(), maxPrice: z.coerce.number().int().positive().optional(), minBedrooms: z.coerce.number().int().nonnegative().optional(), minBathrooms: z.coerce.number().int().nonnegative().optional() });

export async function POST(request: NextRequest) {
  const session = await getSessionUser();
  if (!session) return NextResponse.json({ saved: false }, { status: 401 });
  const parsed = searchSchema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: "Invalid search." }, { status: 400 });
  await prisma.recentSearch.create({ data: { userId: session.sub, ...parsed.data } });
  const old = await prisma.recentSearch.findMany({ where: { userId: session.sub }, orderBy: { createdAt: "desc" }, skip: 10, select: { id: true } });
  if (old.length) await prisma.recentSearch.deleteMany({ where: { id: { in: old.map((item) => item.id) } } });
  return NextResponse.json({ saved: true }, { status: 201 });
}
