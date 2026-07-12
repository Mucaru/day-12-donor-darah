import Link from "next/link";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { UrgencyBadge } from "@/components/request/UrgencyBadge";
import { bloodTypeLabel } from "@/lib/blood-type";
import { getRequestsAction } from "@/actions/request-query.actions";

const STATUS_LABEL: Record<string, string> = {
  OPEN: "Aktif",
  FULFILLED: "Terpenuhi",
  EXPIRED: "Kedaluwarsa",
};

export default async function RequestsListPage() {
  const result = await getRequestsAction();

  if (!result.success) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-8">
        <p className="text-destructive">{result.error}</p>
      </div>
    );
  }

  const requests = result.data;

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Permintaan Darahku</h1>
          <p className="text-sm text-muted-foreground">
            Daftar permintaan darurat yang pernah kamu buat.
          </p>
        </div>
        <Link href="/requests/new" className={buttonVariants()}>
          Buat Permintaan
        </Link>
      </div>

      {requests.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-3 py-16 text-center">
            <p className="font-medium">Belum ada permintaan</p>
            <p className="text-sm text-muted-foreground">
              Buat permintaan darurat kalau kamu atau kerabat butuh donor darah.
            </p>
            <Link
              href="/requests/new"
              className={cn(buttonVariants(), "mt-2")}
            >
              Buat Permintaan Sekarang
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {requests.map((req) => (
            <Link key={req.id} href={`/requests/${req.id}`}>
              <Card className="transition-colors hover:border-primary/50">
                <CardContent className="flex items-center justify-between gap-4 py-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{req.hospitalName}</span>
                      <Badge variant="outline">{bloodTypeLabel(req.bloodType)}</Badge>
                      <UrgencyBadge level={req.urgencyLevel} />
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {req._count.responses} respon · {req._count.notifications} donor dinotifikasi
                    </p>
                  </div>
                  <Badge
                    variant={req.status === "OPEN" ? "default" : "secondary"}
                    className={req.status === "OPEN" ? "bg-primary" : ""}
                  >
                    {STATUS_LABEL[req.status]}
                  </Badge>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}