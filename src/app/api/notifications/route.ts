import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() { const session = await getSessionUser(); if (!session) return NextResponse.json({ error: "Login required." }, { status: 401 }); const data = await prisma.notification.findMany({ where: { userId: session.sub }, orderBy: { createdAt: "desc" }, take: 20 }); return NextResponse.json({ data }); }
export async function PATCH(request: NextRequest) { const session = await getSessionUser(); if (!session) return NextResponse.json({ error: "Login required." }, { status: 401 }); const body = await request.json() as { id?: string }; await prisma.notification.updateMany({ where: { userId: session.sub, ...(body.id ? { id: body.id } : { readAt: null }) }, data: { readAt: new Date() } }); return NextResponse.json({ ok: true }); }
