"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { respondToRequestAction, markRequestFulfilledAction } from "@/actions/request-query.actions";

export function RespondButton({ requestId }: { requestId: string }) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleRespond() {
    setIsSubmitting(true);
    const result = await respondToRequestAction(requestId);
    setIsSubmitting(false);

    if (!result.success) {
      toast.error(result.error);
      return;
    }

    toast.success("Terima kasih! Kontakmu akan terlihat oleh pembuat permintaan.");
    router.refresh();
  }

  return (
    <Button onClick={handleRespond} disabled={isSubmitting} className="w-full">
      {isSubmitting ? "Mengirim..." : "Saya Bersedia Membantu"}
    </Button>
  );
}

export function MarkFulfilledButton({ requestId }: { requestId: string }) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleClick() {
    setIsSubmitting(true);
    const result = await markRequestFulfilledAction(requestId);
    setIsSubmitting(false);

    if (!result.success) {
      toast.error(result.error);
      return;
    }

    toast.success("Permintaan ditandai selesai");
    router.refresh();
  }

  return (
    <Button
      onClick={handleClick}
      disabled={isSubmitting}
      variant="outline"
      size="sm"
    >
      {isSubmitting ? "Memproses..." : "Tandai Selesai"}
    </Button>
  );
}