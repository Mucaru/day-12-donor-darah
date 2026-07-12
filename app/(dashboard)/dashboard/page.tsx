import Link from "next/link";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { bloodTypeLabel } from "@/lib/blood-type";
import { getDonationCooldownStatus } from "@/lib/geo";

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user) return null;

  const donorProfile = await prisma.donorProfile.findUnique({
    where: { userId: session.user.id },
    include: {
      donationHistory: { orderBy: { donationDate: "desc" }, take: 5 },
      requestResponses: {
        include: { request: { select: { hospitalName: true, status: true } } },
        orderBy: { createdAt: "desc" },
        take: 5,
      },
    },
  });

  const myRequestsCount = await prisma.bloodRequest.count({
    where: { requesterId: session.user.id, status: "OPEN" },
  });

  const cooldown = donorProfile
    ? getDonationCooldownStatus(donorProfile.lastDonationDate)
    : null;

  const donationCount = donorProfile?.donationHistory.length ?? 0;
  const badgeTier =
    donationCount >= 10 ? "Gold" : donationCount >= 5 ? "Silver" : donationCount >= 1 ? "Bronze" : null;

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <h1 className="mb-1 text-2xl font-semibold">
        Halo, {session.user.name?.split(" ")[0]} 👋
      </h1>
      <p className="mb-6 text-sm text-muted-foreground">
        Ringkasan aktivitas donor darahmu.
      </p>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Golongan Darah
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold text-primary">
              {donorProfile ? bloodTypeLabel(donorProfile.bloodType) : "-"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Status Kesiapan
            </CardTitle>
          </CardHeader>
          <CardContent>
            {cooldown?.isEligible ? (
              <Badge className="bg-success-bg text-success hover:bg-success-bg">
                Siap Donor
              </Badge>
            ) : cooldown ? (
              <Badge variant="secondary">{cooldown.daysRemaining} hari lagi</Badge>
            ) : (
              <p className="text-sm text-muted-foreground">Belum jadi donor</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Badge Donor
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold">
              {badgeTier ?? "-"}{" "}
              <span className="text-sm font-normal text-muted-foreground">
                ({donationCount}x donasi)
              </span>
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">Permintaan Aktifku</CardTitle>
            <Link
              href="/requests"
              className={cn(buttonVariants({ size: "sm", variant: "ghost" }))}
            >
              Lihat semua
            </Link>
          </CardHeader>
          <CardContent>
            {myRequestsCount === 0 ? (
              <p className="text-sm text-muted-foreground">
                Belum ada permintaan aktif.
              </p>
            ) : (
              <p className="text-sm">
                Kamu punya <strong>{myRequestsCount}</strong> permintaan yang masih aktif.
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Respon Donor Terakhir</CardTitle>
          </CardHeader>
          <CardContent>
            {!donorProfile || donorProfile.requestResponses.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Kamu belum pernah merespon permintaan donor.
              </p>
            ) : (
              <div className="space-y-2">
                {donorProfile.requestResponses.map((res) => (
                  <div key={res.id} className="flex items-center justify-between text-sm">
                    <span>{res.request.hospitalName}</span>
                    <Badge variant="secondary">{res.request.status}</Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}