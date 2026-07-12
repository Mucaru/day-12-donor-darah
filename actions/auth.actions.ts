"use server";

import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { registerSchema, type RegisterInput } from "@/lib/validators/auth";

type ActionResult<T> =
  | { success: true; data: T }
  | { success: false; error: string };

export async function registerAction(
  input: RegisterInput
): Promise<ActionResult<{ userId: string }>> {
  const parsed = registerSchema.safeParse(input);

  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "Data tidak valid",
    };
  }

  const { name, email, password, bloodType, phone, city, latitude, longitude } =
    parsed.data;

  const existing = await prisma.user.findUnique({
    where: { email },
    select: { id: true },
  });

  if (existing) {
    return { success: false, error: "Email sudah terdaftar" };
  }

  const passwordHash = await bcrypt.hash(password, 10);

  try {
    const user = await prisma.user.create({
      data: {
        name,
        email,
        passwordHash,
        donorProfile: {
          create: {
            bloodType,
            phone,
            city,
            latitude,
            longitude,
          },
        },
      },
      select: { id: true },
    });

    return { success: true, data: { userId: user.id } };
  } catch {
    return {
      success: false,
      error: "Gagal membuat akun, coba lagi",
    };
  }
}