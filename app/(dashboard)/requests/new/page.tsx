"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Field, FieldGroup, FieldLabel, FieldError } from "@/components/ui/field";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { LocationPicker } from "@/components/map/LocationPicker";
import { BLOOD_TYPE_OPTIONS, BLOOD_TYPE_LABELS } from "@/lib/blood-type";
import { createRequestSchema, type CreateRequestInput } from "@/lib/validators/request";
import { createRequestAction, estimateMatchingDonorsAction } from "@/actions/request.actions";

const URGENCY_OPTIONS: { value: CreateRequestInput["urgencyLevel"]; label: string }[] = [
  { value: "NORMAL", label: "Normal — bisa ditunggu beberapa hari" },
  { value: "URGENT", label: "Mendesak — dibutuhkan dalam 24 jam" },
  { value: "CRITICAL", label: "Sangat Darurat — dibutuhkan segera" },
];

export default function NewRequestPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [estimate, setEstimate] = useState<number | null>(null);
  const [isEstimating, setIsEstimating] = useState(false);
  const [location, setLocation] = useState({ lat: -6.2, lng: 106.816666 });

  const {
    register,
    handleSubmit,
    control,
    watch,
    formState: { errors },
  } = useForm<CreateRequestInput>({
    resolver: zodResolver(createRequestSchema),
    defaultValues: {
      urgencyLevel: "URGENT",
      expiresInHours: 48,
      latitude: location.lat,
      longitude: location.lng,
    },
  });

  const watchedBloodType = watch("bloodType");

  const runEstimate = useCallback(async () => {
    if (!watchedBloodType) return;
    setIsEstimating(true);
    const result = await estimateMatchingDonorsAction({
      bloodType: watchedBloodType,
      latitude: location.lat,
      longitude: location.lng,
    });
    setIsEstimating(false);
    if (result.success) {
      setEstimate(result.data.count);
    }
  }, [watchedBloodType, location]);

  useEffect(() => {
    runEstimate();
  }, [runEstimate]);

  async function onSubmit(data: CreateRequestInput) {
    setIsSubmitting(true);
    const result = await createRequestAction({
      ...data,
      latitude: location.lat,
      longitude: location.lng,
    });
    setIsSubmitting(false);

    if (!result.success) {
      toast.error(result.error);
      return;
    }

    toast.success(
      `Permintaan dibuat! ${result.data.notifiedCount} pendonor sudah dinotifikasi.`
    );
    router.push(`/requests/${result.data.requestId}`);
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Buat Permintaan Darurat</CardTitle>
          <CardDescription>
            Isi detail permintaan, kami akan langsung notifikasi pendonor yang cocok
            di sekitar lokasi.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} noValidate>
            <FieldGroup>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field data-invalid={!!errors.bloodType}>
                  <FieldLabel htmlFor="bloodType">Golongan Darah Dibutuhkan</FieldLabel>
                  <Controller
                    name="bloodType"
                    control={control}
                    render={({ field }) => (
                      <Select
                        items={BLOOD_TYPE_LABELS}
                        value={field.value ?? ""}
                        onValueChange={field.onChange}
                      >
                        <SelectTrigger id="bloodType" className="w-full">
                          <SelectValue placeholder="Pilih golongan darah" />
                        </SelectTrigger>
                        <SelectContent>
                          {BLOOD_TYPE_OPTIONS.map((opt) => (
                            <SelectItem key={opt.value} value={opt.value}>
                              {opt.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                  <FieldError errors={errors.bloodType ? [errors.bloodType] : []} />
                </Field>

                <Field data-invalid={!!errors.urgencyLevel}>
                  <FieldLabel htmlFor="urgencyLevel">Tingkat Urgensi</FieldLabel>
                  <Controller
                    name="urgencyLevel"
                    control={control}
                    render={({ field }) => (
                      <Select value={field.value} onValueChange={field.onChange}>
                        <SelectTrigger id="urgencyLevel" className="w-full">
                          <SelectValue placeholder="Pilih urgensi" />
                        </SelectTrigger>
                        <SelectContent>
                          {URGENCY_OPTIONS.map((opt) => (
                            <SelectItem key={opt.value} value={opt.value}>
                              {opt.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                  <FieldError errors={errors.urgencyLevel ? [errors.urgencyLevel] : []} />
                </Field>
              </div>

              {watchedBloodType && (
                <Alert className={estimate === 0 ? "border-destructive/50" : "border-primary/30"}>
                  <AlertTitle>
                    {isEstimating
                      ? "Menghitung estimasi..."
                      : estimate === 0
                      ? "Belum ada donor cocok di radius 30 km"
                      : `Estimasi ${estimate} pendonor cocok di sekitar lokasi`}
                  </AlertTitle>
                  <AlertDescription>
                    Estimasi ini akan diperbarui otomatis sesuai golongan darah dan lokasi yang kamu pilih.
                  </AlertDescription>
                </Alert>
              )}

              <Field data-invalid={!!errors.hospitalName}>
                <FieldLabel htmlFor="hospitalName">Nama Rumah Sakit</FieldLabel>
                <Input
                  id="hospitalName"
                  placeholder="RSUD Panembahan Senopati"
                  {...register("hospitalName")}
                />
                <FieldError errors={errors.hospitalName ? [errors.hospitalName] : []} />
              </Field>

              <Field data-invalid={!!errors.description}>
                <FieldLabel htmlFor="description">Deskripsi</FieldLabel>
                <Textarea
                  id="description"
                  placeholder="Jelaskan kondisi pasien dan kebutuhan darah secara singkat..."
                  rows={4}
                  {...register("description")}
                />
                <FieldError errors={errors.description ? [errors.description] : []} />
              </Field>

              <Field>
                <FieldLabel>Lokasi Rumah Sakit</FieldLabel>
                <LocationPicker value={location} onChange={setLocation} />
                <p className="mt-1 text-xs text-muted-foreground">
                  Klik di peta untuk menandai lokasi rumah sakit.
                </p>
              </Field>

              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? "Membuat & mengirim notifikasi..." : "Buat Permintaan & Notifikasi Donor"}
              </Button>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}