import bcrypt from "bcryptjs"
import { jwtVerify, SignJWT } from "jose"
import { cookies } from "next/headers"
import { prisma } from "@/lib/prisma"
import { UserRole } from "@prisma/client"

type SessionPayload = {
  sub: string
  name: string
  role: UserRole
  phone: string
}

const sessionCookie = "naihood_session"
const sessionDuration = 60 * 60 * 24 * 7

function getSecret() {
  const value = process.env.AUTH_SECRET
  if (!value) throw new Error("AUTH_SECRET is required")
  return new TextEncoder().encode(value)
}

export async function hashPassword(p: string) {
  return bcrypt.hash(p, 10)
}

export async function verifyPassword(p: string, h: string) {
  return bcrypt.compare(p, h)
}

export async function createSession(payload: SessionPayload) {
  const token = await new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(payload.sub)
    .setExpirationTime(`${sessionDuration}s`)
    .sign(getSecret())

  ;(await cookies()).set(sessionCookie, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    maxAge: sessionDuration,
    path: "/",
  })
}

export async function getSessionUser(): Promise<SessionPayload | null> {
  const token = (await cookies()).get(sessionCookie)?.value
  if (!token) return null
  try {
    const { payload } = await jwtVerify(token, getSecret())
    const data = payload as any
    return {
      sub: String(data.sub),
      name: String(data.name),
      role: data.role as UserRole,
      phone: String(data.phone),
    }
  } catch {
    return null
  }
}

export async function getCurrentUser() {
  const session = await getSessionUser()
  if (!session) return null
  return prisma.user.findUnique({ where: { id: session.sub } })
}

export function isProvider(role?: UserRole | null) {
  return role === "AGENT" || role === "LANDLORD"
}

export async function clearSession() {
  ;(await cookies()).delete(sessionCookie)
}