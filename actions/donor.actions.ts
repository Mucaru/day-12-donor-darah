"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { haversineDistance, getDonationCooldownStatus } from "@/lib/geo";
import { getCompatibleDonorTypes } from "@/lib/blood-type";
import type { BloodType } from "@/lib/generated/prisma";

export type DonorSearchResult = {
  id: string;
  name: string;
  bloodType: BloodType;
  city: string;
  phone: string;
  latitude: number;
  longitude: number;
  distanceKm: number;
  isAvailable: boolean;
  isEligible: boolean;
  daysUntilEligible: number;
};

type SearchParams = {
  latitude: number;
  longitude: number;
  bloodType?: BloodType;
  onlyCompatible?: boolean;
  radiusKm?: number;
};

type ActionResult<T> =
  | { success: true; data: T }
  | { success: false; error: string };

export async function searchDonorsAction(
  params: SearchParams
): Promise<ActionResult<DonorSearchResult[]>> {
  const session = await auth();
  if (!session?.user) {
    return { success: false, error: "Kamu harus login" };
  }

  const { latitude, longitude, bloodType, onlyCompatible, radiusKm = 25 } = params;

  const bloodTypeFilter = bloodType
    ? onlyCompatible
      ? { in: getCompatibleDonorTypes(bloodType) }
      : bloodType
    : undefined;

  const donors = await prisma.donorProfile.findMany({
    where: {
      ...(bloodTypeFilter ? { bloodType: bloodTypeFilter } : {}),
    },
    select: {
      id: true,
      bloodType: true,
      city: true,
      phone: true,
      latitude: true,
      longitude: true,
      isAvailable: true,
      lastDonationDate: true,
      user: {
        select: { name: true },
      },
    },
  });

  const results: DonorSearchResult[] = donors
    .map((d) => {
      const distanceKm = haversineDistance(latitude, longitude, d.latitude, d.longitude);
      const cooldown = getDonationCooldownStatus(d.lastDonationDate);

      return {
        id: d.id,
        name: d.user.name,
        bloodType: d.bloodType,
        city: d.city,
        phone: d.phone,
        latitude: d.latitude,
        longitude: d.longitude,
        distanceKm,
        isAvailable: d.isAvailable,
        isEligible: cooldown.isEligible,
        daysUntilEligible: cooldown.daysRemaining,
      };
    })
    .filter((d) => d.distanceKm <= radiusKm)
    .sort((a, b) => a.distanceKm - b.distanceKm);

  return { success: true, data: results };
}