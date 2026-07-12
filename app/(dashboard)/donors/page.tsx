"use client";

import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";

import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { DonorsMap } from "@/components/map/DonorsMap";
import { DonorCard } from "@/components/donor/DonorCard";
import { BLOOD_TYPE_OPTIONS, BLOOD_TYPE_LABELS } from "@/lib/blood-type";
import { searchDonorsAction, type DonorSearchResult } from "@/actions/donor.actions";
import type { BloodType } from "@/lib/generated/prisma";

export default function DonorsSearchPage() {
  const [center, setCenter] = useState<{ lat: number; lng: number } | null>(null);
  const [locating, setLocating] = useState(true);
  const [loading, setLoading] = useState(false);
  const [bloodType, setBloodType] = useState<BloodType | undefined>(undefined);
  const [radiusKm, setRadiusKm] = useState(25);
  const [results, setResults] = useState<DonorSearchResult[]>([]);

  useEffect(() => {
    if (!navigator.geolocation) {
      toast.error("Browser tidak mendukung geolocation, pakai lokasi default");
      setCenter({ lat: -7.797, lng: 110.370 });
      setLocating(false);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCenter({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setLocating(false);
      },
      () => {
        toast.error("Gagal ambil lokasi, pakai lokasi default");
        setCenter({ lat: -7.797, lng: 110.370 });
        setLocating(false);
      }
    );
  }, []);

  const runSearch = useCallback(async () => {
    if (!center) return;
    setLoading(true);
    const result = await searchDonorsAction({
      latitude: center.lat,
      longitude: center.lng,
      bloodType,
      radiusKm,
    });
    setLoading(false);

    if (!result.success) {
      toast.error(result.error);
      return;
    }
    setResults(result.data);
  }, [center, bloodType, radiusKm]);

  useEffect(() => {
    runSearch();
  }, [runSearch]);

  return (
    <div className="flex h-[calc(100vh-4rem)] flex-col">
      <div className="flex flex-wrap items-end gap-4 border-b bg-card px-6 py-4">
        <div className="space-y-1.5">
          <Label>Golongan Darah</Label>
          <Select
            items={BLOOD_TYPE_LABELS}
            value={bloodType}
            onValueChange={(v) => setBloodType(v as BloodType)}
          >
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Semua golongan" />
            </SelectTrigger>
            <SelectContent>
              {BLOOD_TYPE_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="radius">Radius (km)</Label>
          <Input
            id="radius"
            type="number"
            min={1}
            max={200}
            value={radiusKm}
            onChange={(e) => setRadiusKm(Number(e.target.value) || 25)}
            className="w-28"
          />
        </div>

        {bloodType && (
          <Button variant="ghost" size="sm" onClick={() => setBloodType(undefined)}>
            Reset filter
          </Button>
        )}

        <p className="ml-auto text-sm text-muted-foreground">
          {loading ? "Mencari..." : `${results.length} pendonor ditemukan`}
        </p>
      </div>

      <div className="grid flex-1 grid-cols-1 overflow-hidden lg:grid-cols-[400px_1fr]">
        <div className="overflow-y-auto border-r p-4">
          {locating || loading ? (
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-20 w-full rounded-lg" />
              ))}
            </div>
          ) : results.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center gap-2 py-16 text-center text-muted-foreground">
              <p className="font-medium">Belum ada pendonor ditemukan</p>
              <p className="text-sm">Coba perluas radius atau ganti filter golongan darah</p>
            </div>
          ) : (
            <div className="space-y-3">
              {results.map((donor) => (
                <DonorCard key={donor.id} donor={donor} />
              ))}
            </div>
          )}
        </div>

        <div className="relative">
          {center && !locating ? (
            <DonorsMap center={center} radiusKm={radiusKm} donors={results} />
          ) : (
            <Skeleton className="h-full w-full" />
          )}
        </div>
      </div>
    </div>
  );
} 