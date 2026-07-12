import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { bloodTypeLabel } from "@/lib/blood-type";
import type { DonorSearchResult } from "@/actions/donor.actions";

export function DonorCard({ donor }: { donor: DonorSearchResult }) {
  return (
    <Card className="transition-colors hover:border-primary/50">
      <CardContent className="flex items-start justify-between gap-3 py-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <p className="font-medium leading-none">{donor.name}</p>
            <Badge variant="outline" className="font-semibold text-primary">
              {bloodTypeLabel(donor.bloodType)}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground">{donor.city}</p>
          <p className="text-xs text-muted-foreground">{donor.distanceKm} km dari kamu</p>
        </div>

        <div className="flex flex-col items-end gap-1">
          {donor.isAvailable && donor.isEligible ? (
            <Badge className="bg-success-bg text-success hover:bg-success-bg">
              Siap Donor
            </Badge>
          ) : !donor.isEligible ? (
            <Badge variant="secondary">
              {donor.daysUntilEligible} hari lagi
            </Badge>
          ) : (
            <Badge variant="secondary">Tidak Aktif</Badge>
          )}
        </div>
      </CardContent>
    </Card>
  );
}