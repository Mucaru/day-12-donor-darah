/**
 * Hitung jarak antara 2 titik koordinat pakai formula Haversine.
 * Return dalam kilometer.
 */
export function haversineDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // radius bumi dalam km
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return Math.round(R * c * 10) / 10; // dibulatkan 1 desimal
}

function toRad(deg: number): number {
  return deg * (Math.PI / 180);
}

/** Cek apakah donor sudah bisa donor lagi (cooldown 3 bulan / 90 hari) */
export function getDonationCooldownStatus(lastDonationDate: Date | null): {
  isEligible: boolean;
  daysRemaining: number;
} {
  if (!lastDonationDate) {
    return { isEligible: true, daysRemaining: 0 };
  }

  const COOLDOWN_DAYS = 90;
  const now = new Date();
  const diffMs = now.getTime() - lastDonationDate.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  const daysRemaining = COOLDOWN_DAYS - diffDays;

  return {
    isEligible: daysRemaining <= 0,
    daysRemaining: Math.max(0, daysRemaining),
  };
}