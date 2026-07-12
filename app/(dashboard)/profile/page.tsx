import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { bloodTypeLabel } from "@/lib/blood-type";
import { getDonationCooldownStatus } from "@/lib/geo";
import { AvailabilityToggle, LogDonationDialog } from "@/components/profile/ProfileActions";

export default async function ProfilePage() {
  const session = await auth();
  if (!session?.user) return null;

  const donorProfile = await prisma.donorProfile.findUnique({
    where: { userId: session.user.id },
    include: {
      donationHistory: { orderBy: { donationDate: "desc" } },
    },
  });

  if (!donorProfile) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-8">
        <p className="text-muted-foreground">Profil donor tidak ditemukan.</p>
      </div>
    );
  }

  const cooldown = getDonationCooldownStatus(donorProfile.lastDonationDate);
  const donationCount = donorProfile.donationHistory.length;
  const badgeTier =
    donationCount >= 10 ? "Gold" : donationCount >= 5 ? "Silver" : donationCount >= 1 ? "Bronze" : null;

  return (
    <div className="mx-auto max-w-2xl space-y-6 px-4 py-8">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">{session.user.name}</CardTitle>
          <p className="text-sm text-muted-foreground">{session.user.email}</p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">Golongan Darah</p>
              <p className="text-lg font-semibold text-primary">
                {bloodTypeLabel(donorProfile.bloodType)}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground">Kota</p>
              <p className="font-medium">{donorProfile.city}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Telepon</p>
              <p className="font-medium">{donorProfile.phone}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Badge</p>
              <p className="font-medium">
                {badgeTier ?? "Belum ada"} ({donationCount}x donasi)
              </p>
            </div>
          </div>

          <Separator />

          <div>
            <p className="mb-2 text-sm text-muted-foreground">Status ketersediaan</p>
            <AvailabilityToggle initialValue={donorProfile.isAvailable} />
            {!cooldown.isEligible && (
              <p className="mt-2 text-xs text-muted-foreground">
                Kamu baru bisa donor lagi dalam {cooldown.daysRemaining} hari
                (cooldown 90 hari sejak donasi terakhir).
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base">Riwayat Donasi</CardTitle>
          <LogDonationDialog />
        </CardHeader>
        <CardContent>
          {donorProfile.donationHistory.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Belum ada riwayat donasi tercatat.
            </p>
          ) : (
            <div className="space-y-2">
              {donorProfile.donationHistory.map((d) => (
                <div
                  key={d.id}
                  className="flex items-center justify-between rounded-lg border p-3 text-sm"
                >
                  <div>
                    <p className="font-medium">{d.location}</p>
                    <p className="text-muted-foreground">
                      {new Intl.DateTimeFormat("id-ID", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      }).format(d.donationDate)}
                    </p>
                  </div>
                  <Badge variant="secondary">Tercatat</Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}