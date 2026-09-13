import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createSession, verifyPassword } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const loginSchema = z.object({ email: z.string().trim().email(), password: z.string().min(1) });
const invalidCredentials = "Email or password is incorrect.";

export async function POST(request: NextRequest) {
  const parsed = loginSchema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: invalidCredentials }, { status: 401 });
  const user = await prisma.user.findUnique({ where: { email: parsed.data.email.toLowerCase() }, select: { id: true, name: true, role: true, passwordHash: true } });
  if (!user?.passwordHash || !(await verifyPassword(parsed.data.password, user.passwordHash))) return NextResponse.json({ error: invalidCredentials }, { status: 401 });
  await createSession(user);
  return NextResponse.json({ data: { name: user.name, role: user.role } });
}
