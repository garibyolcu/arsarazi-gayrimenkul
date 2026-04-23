import * as jose from "jose";
import * as cookie from "cookie";
import { getDb } from "./queries/connection";
import { users } from "@db/schema";
import { eq } from "drizzle-orm";
import { env } from "./lib/env";

export const LOCAL_COOKIE_NAME = "arsarazi_sid";
const JWT_ALG = "HS256";

async function getJwtSecret() {
  return new TextEncoder().encode(env.appSecret);
}

export async function createLocalSessionToken(userId: number) {
  const secret = await getJwtSecret();
  return new jose.SignJWT({ userId, type: "local" })
    .setProtectedHeader({ alg: JWT_ALG })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(secret);
}

export async function verifyLocalSessionToken(token: string) {
  try {
    const secret = await getJwtSecret();
    const { payload } = await jose.jwtVerify(token, secret, {
      clockTolerance: 60,
    });
    return payload as { userId: number; type: string };
  } catch {
    return null;
  }
}

export async function authenticateLocalRequest(headers: Headers) {
  const cookies = cookie.parse(headers.get("cookie") || "");
  const token = cookies[LOCAL_COOKIE_NAME];
  if (!token) return null;

  const claim = await verifyLocalSessionToken(token);
  if (!claim) return null;

  const rows = await getDb()
    .select()
    .from(users)
    .where(eq(users.id, claim.userId))
    .limit(1);
  return rows.at(0) || null;
}
