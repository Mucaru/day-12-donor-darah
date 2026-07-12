import { Resend } from "resend";
import { bloodTypeLabel } from "@/lib/blood-type";
import type { BloodType, UrgencyLevel } from "@/lib/generated/prisma";

const resend = new Resend(process.env.RESEND_API_KEY);

const URGENCY_TEXT: Record<UrgencyLevel, string> = {
  NORMAL: "Normal",
  URGENT: "Mendesak",
  CRITICAL: "Sangat Darurat",
};

interface SendDonorMatchEmailParams {
  to: string;
  donorName: string;
  hospitalName: string;
  bloodType: BloodType;
  urgencyLevel: UrgencyLevel;
  distanceKm: number;
  requestId: string;
}

export async function sendDonorMatchEmail(params: SendDonorMatchEmailParams) {
  const {
    to,
    donorName,
    hospitalName,
    bloodType,
    urgencyLevel,
    distanceKm,
    requestId,
  } = params;

  const detailUrl = `${process.env.NEXT_PUBLIC_APP_URL}/requests/${requestId}`;

  await resend.emails.send({
    from: process.env.RESEND_FROM_EMAIL!,
    to,
    subject: `[${URGENCY_TEXT[urgencyLevel]}] Dibutuhkan donor darah ${bloodTypeLabel(bloodType)} di dekatmu`,
    html: `
      <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
        <h2 style="color: #B91C1C;">Permintaan Donor Darah ${bloodTypeLabel(bloodType)}</h2>
        <p>Halo ${donorName},</p>
        <p>
          Ada permintaan darah <strong>${bloodTypeLabel(bloodType)}</strong> dengan tingkat
          urgensi <strong>${URGENCY_TEXT[urgencyLevel]}</strong> di
          <strong>${hospitalName}</strong>, sekitar <strong>${distanceKm} km</strong> dari lokasimu.
        </p>
        <p>Golongan darahmu cocok untuk membantu permintaan ini.</p>
        <a href="${detailUrl}" style="display: inline-block; background: #B91C1C; color: white; padding: 10px 20px; border-radius: 8px; text-decoration: none; margin-top: 12px;">
          Lihat Detail Permintaan
        </a>
        <p style="color: #6B7280; font-size: 12px; margin-top: 24px;">
          Kamu menerima email ini karena terdaftar sebagai pendonor di DonorKu.
        </p>
      </div>
    `,
  });
}