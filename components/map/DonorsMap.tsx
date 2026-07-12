"use client";

import dynamic from "next/dynamic";
import { Skeleton } from "@/components/ui/skeleton";
import type { DonorSearchResult } from "@/actions/donor.actions";

const DonorsMapInner = dynamic(() => import("./DonorsMapInner"), {
  ssr: false,
  loading: () => <Skeleton className="h-full w-full" />,
});

interface DonorsMapProps {
  center: { lat: number; lng: number };
  radiusKm: number;
  donors: DonorSearchResult[];
}

export function DonorsMap(props: DonorsMapProps) {
  return <DonorsMapInner {...props} />;
}