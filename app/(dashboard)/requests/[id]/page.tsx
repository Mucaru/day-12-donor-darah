import { notFound } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { UrgencyBadge } from "@/components/request/UrgencyBadge";
import { RespondButton, MarkFulfilledButton } from "@/components/request/RequestActions";
import { bloodTypeLabel } from "@/lib/blood-type";
import { getRequestDetailAction } from "@/actions/request-query.actions";

const STATUS_LABEL: Record<string, string> = {
  OPEN: "Aktif",
  FULFILLED: "Terpenuhi",
  EXPIRED: "Kedaluwarsa",
};

export default async function RequestDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const result = await getRequestDetailAction(id);

  if (!result.success) {
    notFound();
  }

  const { request, isOwner, hasDonorProfile, hasResponded } = result.data;

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <CardTitle className="text-2xl">{request.hospitalName}</CardTitle>
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="outline" className="font-semibold text-primary">
                  {bloodTypeLabel(request.bloodType)}
                </Badge>
                <UrgencyBadge level={request.urgencyLevel} />
                <Badge variant={request.status === "OPEN" ? "default" : "secondary"}>
                  {STATUS_LABEL[request.status]}
                </Badge>
              </div>
            </div>
            {isOwner && request.status === "OPEN" && (
              <MarkFulfilledButton requestId={request.id} />
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h3 className="mb-1 text-sm font-medium text-muted-foreground">Deskripsi</h3>
            <p className="text-sm leading-relaxed">{request.description}</p>
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">Dibuat oleh</p>
              <p className="font-medium">{request.requester.name}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Donor dinotifikasi</p>
              <p className="font-medium">{request._count.notifications} orang</p>
            </div>
          </div>

          {!isOwner && request.status === "OPEN" && (
            <>
              <Separator />
              {!hasDonorProfile ? (
                <p className="text-sm text-muted-foreground">
                  Kamu perlu daftar sebagai pendonor untuk bisa merespon permintaan ini.
                </p>
              ) : hasResponded ? (
                <p className="text-sm font-medium text-primary">
                  ✓ Kamu sudah menyatakan bersedia membantu permintaan ini.
                </p>
              ) : (
                <RespondButton requestId={request.id} />
              )}
            </>
          )}

          {isOwner && request.responses.length > 0 && (
            <>
              <Separator />
              <div>
                <h3 className="mb-3 text-sm font-medium text-muted-foreground">
                  {request.responses.length} Donor Bersedia Membantu
                </h3>
                <div className="space-y-2">
                  {request.responses.map((res) => (
                    <div
                      key={res.id}
                      className="flex items-center justify-between rounded-lg border p-3 text-sm"
                    >
                      <div>
                        <p className="font-medium">{res.donorProfile.user.name}</p>
                        <p className="text-muted-foreground">
                          {bloodTypeLabel(res.donorProfile.bloodType)}
                        </p>
                      </div>
                      <a
                        href={`tel:${res.donorProfile.phone}`}
                        className="font-medium text-primary underline-offset-4 hover:underline"
                      >
                        {res.donorProfile.phone}
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}