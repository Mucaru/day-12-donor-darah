"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { toggleAvailabilityAction, logDonationAction } from "@/actions/profile.actions";

export function AvailabilityToggle({ initialValue }: { initialValue: boolean }) {
  const router = useRouter();
  const [isAvailable, setIsAvailable] = useState(initialValue);
  const [isPending, setIsPending] = useState(false);

  async function handleToggle(checked: boolean) {
    setIsAvailable(checked);
    setIsPending(true);
    const result = await toggleAvailabilityAction(checked);
    setIsPending(false);

    if (!result.success) {
      setIsAvailable(!checked);
      toast.error(result.error);
      return;
    }
    toast.success(checked ? "Kamu sekarang siap donor" : "Status diubah jadi tidak aktif");
    router.refresh();
  }

  return (
    <div className="flex items-center gap-3">
      <Switch checked={isAvailable} onCheckedChange={handleToggle} disabled={isPending} />
      <Label>{isAvailable ? "Siap didonor" : "Sedang tidak aktif"}</Label>
    </div>
  );
}

export function LogDonationDialog() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [donationDate, setDonationDate] = useState("");
  const [location, setLocation] = useState("");

  async function handleSubmit() {
    if (!donationDate || !location) {
      toast.error("Tanggal dan lokasi wajib diisi");
      return;
    }
    setIsSubmitting(true);
    const result = await logDonationAction({ donationDate, location });
    setIsSubmitting(false);

    if (!result.success) {
      toast.error(result.error);
      return;
    }

    toast.success("Riwayat donasi berhasil dicatat");
    setOpen(false);
    setDonationDate("");
    setLocation("");
    router.refresh();
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button variant="outline" size="sm" />}>
        Catat Donasi Baru
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Catat Riwayat Donasi</DialogTitle>
        </DialogHeader>
        <FieldGroup>
          <Field>
            <FieldLabel htmlFor="donationDate">Tanggal Donasi</FieldLabel>
            <Input
              id="donationDate"
              type="date"
              value={donationDate}
              onChange={(e) => setDonationDate(e.target.value)}
              max={new Date().toISOString().split("T")[0]}
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="location">Lokasi Donasi</FieldLabel>
            <Input
              id="location"
              placeholder="PMI Kota Yogyakarta"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            />
          </Field>
        </FieldGroup>
        <DialogFooter>
          <Button onClick={handleSubmit} disabled={isSubmitting} className="w-full">
            {isSubmitting ? "Menyimpan..." : "Simpan"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}