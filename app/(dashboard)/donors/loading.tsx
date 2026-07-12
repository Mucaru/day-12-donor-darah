import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="flex h-[calc(100vh-4rem)] flex-col">
      <div className="border-b bg-card px-6 py-4">
        <Skeleton className="h-9 w-64" />
      </div>
      <div className="grid flex-1 grid-cols-1 lg:grid-cols-[400px_1fr]">
        <div className="space-y-3 border-r p-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-20 w-full rounded-lg" />
          ))}
        </div>
        <Skeleton className="h-full w-full rounded-none" />
      </div>
    </div>
  );
}