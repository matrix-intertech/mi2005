import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

const cookieName = "matrix_admin_session";
const sessionMaxAge = 60 * 60 * 8;

function secret() {
  const value = process.env.AUTH_SECRET;
  if (!value || value.length < 32) throw new Error("AUTH_SECRET must be at least 32 characters.");
  return new TextEncoder().encode(value);
}

export async function createSession() {
  const token = await new SignJWT({ role: "admin" })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${sessionMaxAge}s`)
    .sign(secret());

  const store = await cookies();
  store.set(cookieName, token, { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", path: "/", maxAge: sessionMaxAge });
}

export async function clearSession() {
  const store = await cookies();
  store.set(cookieName, "", { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", path: "/", maxAge: 0 });
}

export async function isAdmin() {
  try {
    const token = (await cookies()).get(cookieName)?.value;
    if (!token) return false;
    const { payload } = await jwtVerify(token, secret());
    return payload.role === "admin";
  } catch {
    return false;
  }
}
