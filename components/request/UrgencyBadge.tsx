import { cn } from "@/lib/utils";
import type { UrgencyLevel } from "@/lib/generated/prisma";

const CONFIG: Record<UrgencyLevel, { label: string; className: string }> = {
  NORMAL: {
    label: "Normal",
    className: "bg-urgency-normal/10 text-urgency-normal border-urgency-normal/30",
  },
  URGENT: {
    label: "Mendesak",
    className: "bg-urgency-urgent/10 text-urgency-urgent border-urgency-urgent/30",
  },
  CRITICAL: {
    label: "Sangat Darurat",
    className:
      "bg-urgency-critical/10 text-urgency-critical border-urgency-critical/40 animate-pulse",
  },
};

export function UrgencyBadge({ level }: { level: UrgencyLevel }) {
  const config = CONFIG[level];
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium",
        config.className
      )}
    >
      {config.label}
    </span>
  );
}