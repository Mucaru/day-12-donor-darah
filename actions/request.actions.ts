"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { createRequestSchema, type CreateRequestInput } from "@/lib/validators/request";
import { haversineDistance, getDonationCooldownStatus } from "@/lib/geo";
import { getCompatibleDonorTypes } from "@/lib/blood-type";
import { sendDonorMatchEmail } from "@/lib/resend";

type ActionResult<T> =
  | { success: true; data: T }
  | { success: false; error: string };

const MATCH_RADIUS_KM = 30;

async function findMatchingDonors(params: {
  bloodType: CreateRequestInput["bloodType"];
  latitude: number;
  longitude: number;
}) {
  const compatibleTypes = getCompatibleDonorTypes(params.bloodType);

  const donors = await prisma.donorProfile.findMany({
    where: {
      bloodType: { in: compatibleTypes },
      isAvailable: true,
    },
    select: {
      id: true,
      latitude: true,
      longitude: true,
      lastDonationDate: true,
      user: { select: { name: true, email: true } },
    },
  });

  return donors
    .map((d) => ({
      ...d,
      distanceKm: haversineDistance(params.latitude, params.longitude, d.latitude, d.longitude),
      cooldown: getDonationCooldownStatus(d.lastDonationDate),
    }))
    .filter((d) => d.distanceKm <= MATCH_RADIUS_KM && d.cooldown.isEligible);
}

/** Dipakai form buat kasih estimasi jumlah donor cocok SEBELUM submit */
export async function estimateMatchingDonorsAction(params: {
  bloodType: CreateRequestInput["bloodType"];
  latitude: number;
  longitude: number;
}): Promise<ActionResult<{ count: number }>> {
  const session = await auth();
  if (!session?.user) {
    return { success: false, error: "Kamu harus login" };
  }

  const matches = await findMatchingDonors(params);
  return { success: true, data: { count: matches.length } };
}

export async function createRequestAction(
  input: CreateRequestInput
): Promise<ActionResult<{ requestId: string; notifiedCount: number }>> {
  const session = await auth();
  if (!session?.user) {
    return { success: false, error: "Kamu harus login" };
  }

  const parsed = createRequestSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Data tidak valid" };
  }

  const { bloodType, urgencyLevel, hospitalName, description, latitude, longitude, expiresInHours } =
    parsed.data;

  const expiresAt = new Date(Date.now() + expiresInHours * 60 * 60 * 1000);

  const bloodRequest = await prisma.bloodRequest.create({
    data: {
      requesterId: session.user.id,
      bloodType,
      urgencyLevel,
      hospitalName,
      description,
      latitude,
      longitude,
      expiresAt,
    },
  });

  const matches = await findMatchingDonors({ bloodType, latitude, longitude });

  let notifiedCount = 0;

  for (const donor of matches) {
    try {
      await prisma.requestNotification.create({
        data: {
          requestId: bloodRequest.id,
          donorProfileId: donor.id,
        },
      });

      await sendDonorMatchEmail({
        to: donor.user.email,
        donorName: donor.user.name,
        hospitalName,
        bloodType,
        urgencyLevel,
        distanceKm: donor.distanceKm,
        requestId: bloodRequest.id,
      });

      notifiedCount++;
    } catch {
      // Kalau 1 email gagal (misal donor.user.email invalid), lanjut ke donor
      // berikutnya - jangan gagalkan seluruh proses cuma karena 1 notif gagal
      continue;
    }
  }

  revalidatePath("/requests");
  revalidatePath("/dashboard");

  return {
    success: true,
    data: { requestId: bloodRequest.id, notifiedCount },
  };
}