"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <Card>
        <CardContent className="flex flex-col items-center gap-3 py-10 text-center">
          <p className="text-3xl">⚠️</p>
          <p className="font-medium">Terjadi kesalahan</p>
          <p className="text-sm text-muted-foreground">
            Maaf, ada yang gak beres saat memuat halaman ini. Coba lagi ya.
          </p>
          <Button onClick={reset} className="mt-2">
            Coba Lagi
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}