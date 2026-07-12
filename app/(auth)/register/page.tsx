"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signIn } from "next-auth/react";
import { toast } from "sonner";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Field, FieldGroup, FieldLabel, FieldError } from "@/components/ui/field";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { LocationPicker } from "@/components/map/LocationPicker";
import { registerSchema, type RegisterInput } from "@/lib/validators/auth";
import { BLOOD_TYPE_OPTIONS, BLOOD_TYPE_LABELS } from "@/lib/blood-type";
import { registerAction } from "@/actions/auth.actions";

export default function RegisterPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [location, setLocation] = useState({ lat: -6.2, lng: 106.816666 });

  const {
    register,
    handleSubmit,
    control,
    setValue,
    formState: { errors },
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      latitude: location.lat,
      longitude: location.lng,
    },
  });

  function updateLocation(coords: { lat: number; lng: number }) {
    setLocation(coords);
    setValue("latitude", coords.lat, { shouldValidate: true });
    setValue("longitude", coords.lng, { shouldValidate: true });
  }

  function handleUseMyLocation() {
    if (!navigator.geolocation) {
      toast.error("Browser kamu tidak mendukung geolocation");
      return;
    }
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        updateLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setIsLocating(false);
        toast.success("Lokasi berhasil diambil");
      },
      () => {
        setIsLocating(false);
        toast.error("Gagal mengambil lokasi, coba pilih manual di peta");
      }
    );
  }

  async function onSubmit(data: RegisterInput) {
    setIsSubmitting(true);
    const result = await registerAction(data);

    if (!result.success) {
      toast.error(result.error);
      setIsSubmitting(false);
      return;
    }

    const loginResult = await signIn("credentials", {
      email: data.email,
      password: data.password,
      redirect: false,
    });

    setIsSubmitting(false);

    if (loginResult?.error) {
      toast.success("Akun berhasil dibuat, silakan login");
      router.push("/login");
      return;
    }

    toast.success("Selamat datang! Akun kamu berhasil dibuat");
    router.push("/dashboard");
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/30 px-4 py-10">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle className="text-2xl">Daftar Sebagai Pendonor</CardTitle>
          <CardDescription>
            Isi data diri dan lokasi kamu supaya bisa ditemukan saat ada yang
            butuh donor darah di sekitarmu.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} noValidate>
            <FieldGroup>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field data-invalid={!!errors.name}>
                  <FieldLabel htmlFor="name">Nama Lengkap</FieldLabel>
                  <Input
                    id="name"
                    placeholder="Nama kamu"
                    autoComplete="name"
                    {...register("name")}
                  />
                  <FieldError errors={errors.name ? [errors.name] : []} />
                </Field>

                <Field data-invalid={!!errors.phone}>
                  <FieldLabel htmlFor="phone">Nomor Telepon</FieldLabel>
                  <Input
                    id="phone"
                    type="tel"
                    inputMode="numeric"
                    autoComplete="tel"
                    placeholder="081234567890"
                    {...register("phone")}
                  />
                  <FieldError errors={errors.phone ? [errors.phone] : []} />
                </Field>
              </div>

              <Field data-invalid={!!errors.email}>
                <FieldLabel htmlFor="email">Email</FieldLabel>
                <Input
                  id="email"
                  type="email"
                  inputMode="email"
                  autoComplete="email"
                  placeholder="kamu@email.com"
                  {...register("email")}
                />
                <FieldError errors={errors.email ? [errors.email] : []} />
              </Field>

              <Field data-invalid={!!errors.password}>
                <FieldLabel htmlFor="password">Password</FieldLabel>
                <Input
                  id="password"
                  type="password"
                  autoComplete="new-password"
                  placeholder="Minimal 6 karakter"
                  {...register("password")}
                />
                <FieldError errors={errors.password ? [errors.password] : []} />
              </Field>

              <div className="grid gap-4 sm:grid-cols-2">
                <Field data-invalid={!!errors.bloodType}>
                  <FieldLabel htmlFor="bloodType">Golongan Darah</FieldLabel>
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

                <Field data-invalid={!!errors.city}>
                  <FieldLabel htmlFor="city">Kota</FieldLabel>
                  <Input
                    id="city"
                    placeholder="Yogyakarta"
                    autoComplete="address-level2"
                    {...register("city")}
                  />
                  <FieldError errors={errors.city ? [errors.city] : []} />
                </Field>
              </div>

              <Field>
                <div className="mb-2 flex items-center justify-between">
                  <FieldLabel>Lokasi Kamu</FieldLabel>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleUseMyLocation}
                    disabled={isLocating}
                  >
                    {isLocating ? "Mengambil lokasi..." : "Gunakan lokasi saya"}
                  </Button>
                </div>
                <LocationPicker
                  value={location}
                  onChange={updateLocation}
                />
                <p className="mt-1 text-xs text-muted-foreground">
                  Klik di peta untuk menandai lokasi kamu, atau pakai tombol
                  &quot;Gunakan lokasi saya&quot; di atas.
                </p>
              </Field>

              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? "Membuat akun..." : "Daftar"}
              </Button>

              <p className="text-center text-sm text-muted-foreground">
                Sudah punya akun?{" "}
                <Link href="/login" className="font-medium text-primary underline-offset-4 hover:underline">
                  Masuk di sini
                </Link>
              </p>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}