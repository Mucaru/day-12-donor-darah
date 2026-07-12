"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";

type ActionResult<T> =
  | { success: true; data: T }
  | { success: false; error: string };

export async function getRequestsAction() {
  const session = await auth();
  if (!session?.user) {
    return { success: false as const, error: "Kamu harus login" };
  }

  const requests = await prisma.bloodRequest.findMany({
    where: { requesterId: session.user.id },
    orderBy: { createdAt: "desc" },
    include: {
      _count: { select: { responses: true, notifications: true } },
    },
  });

  return { success: true as const, data: requests };
}

export async function getRequestDetailAction(requestId: string) {
  const session = await auth();
  if (!session?.user) {
    return { success: false as const, error: "Kamu harus login" };
  }

  const request = await prisma.bloodRequest.findUnique({
    where: { id: requestId },
    include: {
      requester: { select: { name: true, email: true } },
      responses: {
        include: {
          donorProfile: {
            select: {
              phone: true,
              bloodType: true,
              user: { select: { name: true } },
            },
          },
        },
        orderBy: { createdAt: "desc" },
      },
      _count: { select: { notifications: true } },
    },
  });

  if (!request) {
    return { success: false as const, error: "Permintaan tidak ditemukan" };
  }

  const isOwner = request.requesterId === session.user.id;

  const myDonorProfile = await prisma.donorProfile.findUnique({
    where: { userId: session.user.id },
    select: { id: true },
  });

  const myResponse = myDonorProfile
    ? request.responses.find((r) => r.donorProfileId === myDonorProfile.id)
    : undefined;

  return {
    success: true as const,
    data: {
      request,
      isOwner,
      hasDonorProfile: !!myDonorProfile,
      hasResponded: !!myResponse,
    },
  };
}

export async function respondToRequestAction(
  requestId: string,
  message?: string
): Promise<ActionResult<{ responseId: string }>> {
  const session = await auth();
  if (!session?.user) {
    return { success: false, error: "Kamu harus login" };
  }

  const donorProfile = await prisma.donorProfile.findUnique({
    where: { userId: session.user.id },
    select: { id: true },
  });

  if (!donorProfile) {
    return { success: false, error: "Kamu belum terdaftar sebagai pendonor" };
  }

  const existing = await prisma.requestResponse.findUnique({
    where: {
      requestId_donorProfileId: {
        requestId,
        donorProfileId: donorProfile.id,
      },
    },
  });

  if (existing) {
    return { success: false, error: "Kamu sudah merespon permintaan ini" };
  }

  try {
    const response = await prisma.requestResponse.create({
      data: {
        requestId,
        donorProfileId: donorProfile.id,
        message,
      },
    });

    revalidatePath(`/requests/${requestId}`);
    return { success: true, data: { responseId: response.id } };
  } catch {
    return { success: false, error: "Gagal mengirim respon, coba lagi" };
  }
}

export async function markRequestFulfilledAction(
  requestId: string
): Promise<ActionResult<null>> {
  const session = await auth();
  if (!session?.user) {
    return { success: false, error: "Kamu harus login" };
  }

  const request = await prisma.bloodRequest.findUnique({
    where: { id: requestId },
    select: { requesterId: true },
  });

  if (!request || request.requesterId !== session.user.id) {
    return { success: false, error: "Kamu tidak berhak mengubah permintaan ini" };
  }

  await prisma.bloodRequest.update({
    where: { id: requestId },
    data: { status: "FULFILLED" },
  });

  revalidatePath(`/requests/${requestId}`);
  revalidatePath("/requests");

  return { success: true, data: null };
}