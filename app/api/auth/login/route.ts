import { NextResponse } from "next/server";
import { adminCookieName, adminSessionToken, passwordMatches } from "@/lib/admin-auth";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null) as { password?: unknown } | null;
  if (!body || typeof body.password !== "string" || !passwordMatches(body.password)) {
    return NextResponse.json({ error: "Das Passwort stimmt nicht." }, { status: 401 });
  }

  const response = NextResponse.json({ ok: true });
  response.cookies.set(adminCookieName, adminSessionToken(), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
  return response;
}
