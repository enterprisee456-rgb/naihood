import bcrypt from "bcryptjs";
import { jwtVerify, SignJWT } from "jose";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";

const sessionCookie = "naihood_session";
const sessionDuration = 60 * 60 * 24 * 7;

type SessionPayload = { sub: string; name: string; role: string };

function getSecret() {
  const value = process.env.AUTH_SECRET;
  if (!value) throw new Error("AUTH_SECRET is required for authentication.");
  return new TextEncoder().encode(value);
}

export async function hashPassword(password: string) { return bcrypt.hash(password, 12); }
export async function verifyPassword(password: string, hash: string) { return bcrypt.compare(password, hash); }

export async function createSession(user: { id: string; name: string; role: string }) {
  const token = await new SignJWT({ name: user.name, role: user.role }).setProtectedHeader({ alg: "HS256" }).setSubject(user.id).setIssuedAt().setExpirationTime(`${sessionDuration}s`).sign(getSecret());
  (await cookies()).set(sessionCookie, token, { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", path: "/", maxAge: sessionDuration });
}

export async function clearSession() { (await cookies()).delete(sessionCookie); }

export async function getSessionUser(): Promise<SessionPayload | null> {
  const token = (await cookies()).get(sessionCookie)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, getSecret());
    if (!payload.sub || typeof payload.name !== "string" || typeof payload.role !== "string") return null;
    return { sub: payload.sub, name: payload.name, role: payload.role };
  } catch { return null; }
}

export async function getCurrentUser() {
  const session = await getSessionUser();
  if (!session) return null;
  return prisma.user.findUnique({ where: { id: session.sub }, select: { id: true, name: true, email: true, phone: true, role: true } });
}

export function isProvider(role?: string | null) { return role === "AGENT" || role === "LANDLORD"; }
