import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createSession, hashPassword } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const signupSchema = z.object({ name: z.string().trim().min(2, "Enter your full name.").max(100), email: z.string().trim().email("Enter a valid email address.").max(254), password: z.string().min(8, "Use at least 8 characters.").max(128), phone: z.string().trim().min(7, "Enter a valid phone number.").max(30), role: z.enum(["SEEKER", "AGENT"]) });

export async function POST(request: NextRequest) {
  const parsed = signupSchema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Check your details." }, { status: 400 });
  const input = parsed.data;
  const existing = await prisma.user.findFirst({ where: { OR: [{ email: input.email.toLowerCase() }, { phone: input.phone }] }, select: { id: true } });
  if (existing) return NextResponse.json({ error: "An account with those details already exists." }, { status: 409 });
  const user = await prisma.user.create({ data: { name: input.name, email: input.email.toLowerCase(), passwordHash: await hashPassword(input.password), phone: input.phone, role: input.role }, select: { id: true, name: true, role: true } });
  await createSession(user);
  return NextResponse.json({ data: { name: user.name, role: user.role } }, { status: 201 });
}
