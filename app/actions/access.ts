"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { consumeRateLimit } from "@/lib/rate-limit";

const ACCESS_COOKIE = "opsleak_access";

function configuredKey(): string | undefined {
  const key = process.env.OPSLEAK_ACCESS_KEY?.trim();
  return key && key.length >= 12 ? key : undefined;
}

function sameSecret(left: string, right: string): boolean {
  if (left.length !== right.length) {
    return false;
  }

  let mismatch = 0;

  for (let index = 0; index < left.length; index += 1) {
    mismatch |= left.charCodeAt(index) ^ right.charCodeAt(index);
  }

  return mismatch === 0;
}

export async function unlockAccess(
  _previous: { ok: false; message: string },
  formData: FormData,
): Promise<{ ok: false; message: string }> {
  if (!consumeRateLimit("login", 8, 60_000)) {
    return { ok: false, message: "Demasiados intentos. Espera un minuto." };
  }

  const expected = configuredKey();
  const presented = String(formData.get("accessKey") ?? "");

  if (!expected || !sameSecret(presented, expected)) {
    return { ok: false, message: "Clave incorrecta." };
  }

  const jar = await cookies();
  jar.set(ACCESS_COOKIE, expected, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });

  redirect("/dashboard");
}
