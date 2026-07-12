import Link from "next/link";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export default async function LandingPage() {
  const session = await auth();

  const [donorCount, requestCount] = await Promise.all([
    prisma.donorProfile.count(),
    prisma.bloodRequest.count(),
  ]);

  return (
    <div className="min-h-screen">
      <header className="border-b bg-card/95 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
          <div className="flex items-center gap-2 font-semibold">
            <span className="text-lg text-primary">🩸</span>
            <span>DonorKu</span>
          </div>
          {session?.user ? (
            <Link href="/dashboard" className={buttonVariants({ size: "sm" })}>
              Buka Dashboard
            </Link>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                href="/login"
                className={buttonVariants({ variant: "ghost", size: "sm" })}
              >
                Masuk
              </Link>
              <Link href="/register" className={buttonVariants({ size: "sm" })}>
                Daftar Jadi Donor
              </Link>
            </div>
          )}
        </div>
      </header>

      <section className="mx-auto max-w-4xl px-4 py-20 text-center">
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
          Satu tetes darahmu,{" "}
          <span className="text-primary">nyawa untuk orang lain</span>
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
          DonorKu menghubungkan pendonor darah dengan orang yang membutuhkan
          secara cepat berdasarkan golongan darah dan lokasi terdekat.
        </p>
        <div className="mt-8 flex items-center justify-center gap-3">
          <Link href="/register" className={cn(buttonVariants({ size: "lg" }))}>
            Daftar Sebagai Pendonor
          </Link>
          <Link
            href="/login"
            className={cn(buttonVariants({ variant: "outline", size: "lg" }))}
          >
            Cari Pendonor
          </Link>
        </div>

        <div className="mx-auto mt-16 grid max-w-md grid-cols-2 gap-4">
          <Card>
            <CardContent className="py-6 text-center">
              <p className="text-3xl font-bold text-primary">{donorCount}</p>
              <p className="text-sm text-muted-foreground">Pendonor Terdaftar</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="py-6 text-center">
              <p className="text-3xl font-bold text-primary">{requestCount}</p>
              <p className="text-sm text-muted-foreground">Permintaan Dibantu</p>
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="border-t bg-secondary/30 py-16">
        <div className="mx-auto max-w-5xl px-4">
          <h2 className="mb-10 text-center text-2xl font-semibold">
            Cara Kerja DonorKu
          </h2>
          <div className="grid gap-6 sm:grid-cols-3">
            <div className="text-center">
              <div className="mx-auto mb-3 flex size-12 items-center justify-center rounded-full bg-primary/10 text-xl font-semibold text-primary">
                1
              </div>
              <h3 className="mb-1 font-medium">Daftar Jadi Pendonor</h3>
              <p className="text-sm text-muted-foreground">
                Isi golongan darah dan lokasimu, sekali daftar langsung siap
                membantu.
              </p>
            </div>
            <div className="text-center">
              <div className="mx-auto mb-3 flex size-12 items-center justify-center rounded-full bg-primary/10 text-xl font-semibold text-primary">
                2
              </div>
              <h3 className="mb-1 font-medium">Buat Permintaan Darurat</h3>
              <p className="text-sm text-muted-foreground">
                Butuh darah? Buat permintaan, sistem otomatis mencari dan
                menotifikasi pendonor yang cocok.
              </p>
            </div>
            <div className="text-center">
              <div className="mx-auto mb-3 flex size-12 items-center justify-center rounded-full bg-primary/10 text-xl font-semibold text-primary">
                3
              </div>
              <h3 className="mb-1 font-medium">Terhubung & Membantu</h3>
              <p className="text-sm text-muted-foreground">
                Pendonor yang bersedia langsung terhubung dengan pemohon lewat
                kontak yang tersedia.
              </p>
            </div>
          </div>
        </div>
      </section>

      <footer className="border-t py-6 text-center text-sm text-muted-foreground">
        DonorKu — Dibuat untuk portfolio 150 Days of Web Projects Challenge.
      </footer>
    </div>
  );
}