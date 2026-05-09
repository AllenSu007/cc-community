import type { Context, Next } from "hono";
import { HTTPException } from "hono/http-exception";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env["JWT_SECRET"] ?? "dev-secret-change-in-production";

export interface JwtPayload {
  userId: string;
  username: string;
}

export function getJwtSecret(): string {
  return JWT_SECRET;
}

export async function requireAuth(c: Context, next: Next) {
  const header = c.req.header("Authorization");
  if (!header?.startsWith("Bearer ")) {
    throw new HTTPException(401, { message: "Missing or invalid Authorization header" });
  }

  const token = header.slice(7);
  try {
    const payload = jwt.verify(token, JWT_SECRET) as JwtPayload;
    c.set("user", payload);
    await next();
  } catch {
    throw new HTTPException(401, { message: "Invalid or expired token" });
  }
}

export function getUser(c: Context): JwtPayload {
  const user = c.get("user") as JwtPayload | undefined;
  if (!user) {
    throw new HTTPException(401, { message: "Not authenticated" });
  }
  return user;
}
