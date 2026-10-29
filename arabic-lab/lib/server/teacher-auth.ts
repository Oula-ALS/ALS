// The teacher area is protected by TEACHER_PASSWORD. After logging in, the browser
// keeps a signed cookie for 12 hours. Nothing secret is stored in the cookie.
import { createHmac, timingSafeEqual } from "node:crypto";

export const COOKIE = "alsama_teacher";
const HOURS = 12;

const sign = (secret: string, expires: number) => createHmac("sha256", secret).update(`teacher:${expires}`).digest("hex");

function safeEqual(a: string, b: string) {
  const x = Buffer.from(a);
  const y = Buffer.from(b);
  return x.length === y.length && timingSafeEqual(x, y);
}

export function passwordConfigured() {
  return Boolean(process.env.TEACHER_PASSWORD);
}

export function checkPassword(given: unknown) {
  const real = process.env.TEACHER_PASSWORD;
  return Boolean(real) && typeof given === "string" && safeEqual(given, real!);
}

export function sessionCookie() {
  const expires = Date.now() + HOURS * 3600_000;
  const value = `${expires}.${sign(process.env.TEACHER_PASSWORD!, expires)}`;
  const secure = process.env.NODE_ENV === "production" ? "; Secure" : "";
  return `${COOKIE}=${value}; Path=/; HttpOnly; SameSite=Strict; Max-Age=${HOURS * 3600}${secure}`;
}

export const clearCookie = () => `${COOKIE}=; Path=/; HttpOnly; SameSite=Strict; Max-Age=0`;

export function isTeacher(req: Request) {
  const secret = process.env.TEACHER_PASSWORD;
  if (!secret) return false;
  const raw = req.headers.get("cookie") ?? "";
  const value = raw
    .split(";")
    .map((c) => c.trim())
    .find((c) => c.startsWith(`${COOKIE}=`))
    ?.slice(COOKIE.length + 1);
  if (!value) return false;
  const [exp, sig] = value.split(".");
  const expires = Number(exp);
  if (!expires || expires < Date.now() || !sig) return false;
  return safeEqual(sig, sign(secret, expires));
}
