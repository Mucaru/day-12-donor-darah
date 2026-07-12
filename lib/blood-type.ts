import type { BloodType } from "@/lib/generated/prisma";

export const BLOOD_TYPE_LABELS: Record<BloodType, string> = {
  A_POS: "A+",
  A_NEG: "A-",
  B_POS: "B+",
  B_NEG: "B-",
  AB_POS: "AB+",
  AB_NEG: "AB-",
  O_POS: "O+",
  O_NEG: "O-",
};

export const BLOOD_TYPE_OPTIONS: { value: BloodType; label: string }[] =
  Object.entries(BLOOD_TYPE_LABELS).map(([value, label]) => ({
    value: value as BloodType,
    label,
  }));

/**
 * Compatibility matrix: siapa aja yang BISA MENDONOR ke golongan darah tertentu.
 * Key = golongan darah resipien (yang butuh darah)
 * Value = daftar golongan darah donor yang cocok
 *
 * Aturan dasar:
 * - O- = universal donor (bisa donor ke siapa aja)
 * - AB+ = universal recipient (bisa nerima dari siapa aja)
 * - Rhesus negatif hanya bisa terima dari rhesus negatif
 * - Rhesus positif bisa terima dari rhesus positif & negatif (golongan sama)
 */
export const DONOR_COMPATIBILITY: Record<BloodType, BloodType[]> = {
  A_POS: ["A_POS", "A_NEG", "O_POS", "O_NEG"],
  A_NEG: ["A_NEG", "O_NEG"],
  B_POS: ["B_POS", "B_NEG", "O_POS", "O_NEG"],
  B_NEG: ["B_NEG", "O_NEG"],
  AB_POS: ["A_POS", "A_NEG", "B_POS", "B_NEG", "AB_POS", "AB_NEG", "O_POS", "O_NEG"],
  AB_NEG: ["A_NEG", "B_NEG", "AB_NEG", "O_NEG"],
  O_POS: ["O_POS", "O_NEG"],
  O_NEG: ["O_NEG"],
};

/** Cek apakah golongan darah donor cocok untuk resipien tertentu */
export function isCompatibleDonor(
  donorType: BloodType,
  recipientType: BloodType
): boolean {
  return DONOR_COMPATIBILITY[recipientType].includes(donorType);
}

/** Ambil semua golongan darah yang cocok jadi donor untuk resipien tertentu */
export function getCompatibleDonorTypes(recipientType: BloodType): BloodType[] {
  return DONOR_COMPATIBILITY[recipientType];
}

export function bloodTypeLabel(type: BloodType): string {
  return BLOOD_TYPE_LABELS[type];
}