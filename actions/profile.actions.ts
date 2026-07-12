"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { z } from "zod";

type ActionResult<T> =
  | { success: true; data: T }
  | { success: false; error: string };

export async function toggleAvailabilityAction(
  isAvailable: boolean
): Promise<ActionResult<null>> {
  const session = await auth();
  if (!session?.user) return { success: false, error: "Kamu harus login" };

  await prisma.donorProfile.update({
    where: { userId: session.user.id },
    data: { isAvailable },
  });

  revalidatePath("/profile");
  revalidatePath("/dashboard");
  return { success: true, data: null };
}

const logDonationSchema = z.object({
  donationDate: z.string(),
  location: z.string().min(2),
  notes: z.string().optional(),
});

export async function logDonationAction(
  input: z.infer<typeof logDonationSchema>
): Promise<ActionResult<null>> {
  const session = await auth();
  if (!session?.user) return { success: false, error: "Kamu harus login" };

  const parsed = logDonationSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: "Data tidak valid" };
  }

  const donorProfile = await prisma.donorProfile.findUnique({
    where: { userId: session.user.id },
    select: { id: true },
  });

  if (!donorProfile) {
    return { success: false, error: "Profil donor tidak ditemukan" };
  }

  const donationDate = new Date(parsed.data.donationDate);

  await prisma.$transaction([
    prisma.donationHistory.create({
      data: {
        donorProfileId: donorProfile.id,
        donationDate,
        location: parsed.data.location,
        notes: parsed.data.notes,
      },
    }),
    prisma.donorProfile.update({
      where: { id: donorProfile.id },
      data: { lastDonationDate: donationDate },
    }),
  ]);

  revalidatePath("/profile");
  revalidatePath("/dashboard");
  return { success: true, data: null };
}