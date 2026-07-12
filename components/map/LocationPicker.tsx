"use client";

import dynamic from "next/dynamic";
import { Skeleton } from "@/components/ui/skeleton";

const LocationPickerInner = dynamic(
  () => import("./LocationPickerInner"),
  {
    ssr: false,
    loading: () => <Skeleton className="h-[300px] w-full rounded-lg" />,
  }
);

type LatLng = { lat: number; lng: number };

interface LocationPickerProps {
  value: LatLng | null;
  onChange: (coords: LatLng) => void;
  defaultCenter?: LatLng;
}

export function LocationPicker(props: LocationPickerProps) {
  return <LocationPickerInner {...props} />;
}


