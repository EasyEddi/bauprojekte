import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

export const adminCookieName = "bauprojekte-admin";

function adminPassword() {
  const password = process.env.ADMIN_PASSWORD;
  if (!password) throw new Error("ADMIN_PASSWORD ist nicht konfiguriert.");
  return password;
}

export function adminSessionToken() {
  return createHmac("sha256", adminPassword()).update("bauprojekte-admin-session-v1").digest("hex");
}

export function passwordMatches(candidate: string) {
  const expected = Buffer.from(adminPassword());
  const received = Buffer.from(candidate);
  return expected.length === received.length && timingSafeEqual(expected, received);
}

export async function isAdmin() {
  const cookieStore = await cookies();
  const candidate = cookieStore.get(adminCookieName)?.value;
  if (!candidate) return false;
  const expected = adminSessionToken();
  const candidateBuffer = Buffer.from(candidate);
  const expectedBuffer = Buffer.from(expected);
  return candidateBuffer.length === expectedBuffer.length && timingSafeEqual(candidateBuffer, expectedBuffer);
}
