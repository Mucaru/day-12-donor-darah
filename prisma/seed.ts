import { config } from "dotenv";
config({ path: ".env.local" });

import { PrismaClient } from "../lib/generated/prisma";
import { PrismaNeon } from "@prisma/adapter-neon";
import bcrypt from "bcryptjs";

const adapter = new PrismaNeon({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

// Semua akun demo pakai password yang sama biar gampang di-demo-in
const DEMO_PASSWORD = "demo1234";

// Titik-titik di sekitar Yogyakarta biar radius search kerasa realistis
const DONORS = [
  { name: "Budi Santoso", email: "budi@demo.donorku.app", bloodType: "O_POS", city: "Yogyakarta", phone: "081234567801", lat: -7.7828, lng: 110.3672, lastDonation: daysAgo(120) },
  { name: "Siti Rahma", email: "siti@demo.donorku.app", bloodType: "A_POS", city: "Sleman", phone: "081234567802", lat: -7.7326, lng: 110.4023, lastDonation: daysAgo(45) },
  { name: "Andi Wijaya", email: "andi@demo.donorku.app", bloodType: "B_POS", city: "Bantul", phone: "081234567803", lat: -7.8878, lng: 110.3287, lastDonation: null },
  { name: "Dewi Lestari", email: "dewi@demo.donorku.app", bloodType: "AB_POS", city: "Yogyakarta", phone: "081234567804", lat: -7.8014, lng: 110.3644, lastDonation: daysAgo(200) },
  { name: "Rizky Pratama", email: "rizky@demo.donorku.app", bloodType: "O_NEG", city: "Kulon Progo", phone: "081234567805", lat: -7.8256, lng: 110.1642, lastDonation: daysAgo(15) },
  { name: "Ayu Kusuma", email: "ayu@demo.donorku.app", bloodType: "O_POS", city: "Gunungkidul", phone: "081234567806", lat: -7.9722, lng: 110.6069, lastDonation: daysAgo(300) },
  { name: "Fajar Nugroho", email: "fajar@demo.donorku.app", bloodType: "A_NEG", city: "Yogyakarta", phone: "081234567807", lat: -7.7956, lng: 110.3695, lastDonation: null },
  { name: "Maya Anggraini", email: "maya@demo.donorku.app", bloodType: "B_NEG", city: "Sleman", phone: "081234567808", lat: -7.7183, lng: 110.3568, lastDonation: daysAgo(80) },
  { name: "Doni Kurniawan", email: "doni@demo.donorku.app", bloodType: "AB_NEG", city: "Bantul", phone: "081234567809", lat: -7.8592, lng: 110.3411, lastDonation: daysAgo(30) },
  { name: "Putri Handayani", email: "putri@demo.donorku.app", bloodType: "O_POS", city: "Yogyakarta", phone: "081234567810", lat: -7.7891, lng: 110.3789, lastDonation: daysAgo(95) },
] as const;

const REQUESTER = {
  name: "RS Panembahan Senopati",
  email: "requester@demo.donorku.app",
};

function daysAgo(days: number): Date {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d;
}

async function main() {
  console.log("Seeding data demo...");

  const passwordHash = await bcrypt.hash(DEMO_PASSWORD, 10);

  // Bersihkan data lama biar seed idempotent
  await prisma.requestNotification.deleteMany();
  await prisma.requestResponse.deleteMany();
  await prisma.donationHistory.deleteMany();
  await prisma.bloodRequest.deleteMany();
  await prisma.donorProfile.deleteMany();
  await prisma.user.deleteMany({
    where: { email: { contains: "@demo.donorku.app" } },
  });

  // Buat requester (akun buat demo "buat permintaan darurat")
  const requesterUser = await prisma.user.create({
    data: {
      name: REQUESTER.name,
      email: REQUESTER.email,
      passwordHash,
    },
  });

  // Buat semua donor + profil
  const createdDonors = [];
  for (const donor of DONORS) {
    const user = await prisma.user.create({
      data: {
        name: donor.name,
        email: donor.email,
        passwordHash,
        donorProfile: {
          create: {
            bloodType: donor.bloodType,
            city: donor.city,
            phone: donor.phone,
            latitude: donor.lat,
            longitude: donor.lng,
            isAvailable: true,
            lastDonationDate: donor.lastDonation,
          },
        },
      },
      include: { donorProfile: true },
    });
    createdDonors.push(user);

    if (donor.lastDonation && user.donorProfile) {
      const historyCount =
        donor.name === "Dewi Lestari" ? 12 :
        donor.name === "Ayu Kusuma" ? 6 :
        2;

      for (let i = 0; i < historyCount; i++) {
        await prisma.donationHistory.create({
          data: {
            donorProfileId: user.donorProfile.id,
            donationDate: daysAgo(120 + i * 100),
            location: `PMI ${donor.city}`,
            notes: i === 0 ? "Donasi rutin" : null,
          },
        });
      }
    }
  }

  const criticalRequest = await prisma.bloodRequest.create({
    data: {
      requesterId: requesterUser.id,
      bloodType: "O_POS",
      urgencyLevel: "CRITICAL",
      hospitalName: "RSUD Panembahan Senopati",
      description:
        "Pasien membutuhkan transfusi darurat pasca kecelakaan lalu lintas. Mohon bantuan segera.",
      latitude: -7.8878,
      longitude: 110.3287,
      status: "OPEN",
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
    },
  });

  await prisma.bloodRequest.create({
    data: {
      requesterId: requesterUser.id,
      bloodType: "AB_POS",
      urgencyLevel: "URGENT",
      hospitalName: "RS Bethesda Yogyakarta",
      description:
        "Pasien operasi terjadwal membutuhkan stok darah AB+ dalam 24 jam ke depan.",
      latitude: -7.7828,
      longitude: 110.3672,
      status: "OPEN",
      expiresAt: new Date(Date.now() + 48 * 60 * 60 * 1000),
    },
  });

  await prisma.bloodRequest.create({
    data: {
      requesterId: requesterUser.id,
      bloodType: "B_POS",
      urgencyLevel: "NORMAL",
      hospitalName: "RS JIH Yogyakarta",
      description: "Permintaan darah untuk operasi terencana, sudah terpenuhi.",
      latitude: -7.7326,
      longitude: 110.4023,
      status: "FULFILLED",
      expiresAt: daysAgo(-5),
    },
  });

  const oPosDonor = createdDonors.find((d) => d.donorProfile?.bloodType === "O_POS");
  if (oPosDonor?.donorProfile) {
    await prisma.requestResponse.create({
      data: {
        requestId: criticalRequest.id,
        donorProfileId: oPosDonor.donorProfile.id,
        message: "Saya bisa datang dalam 30 menit.",
      },
    });
  }

  console.log("Seed selesai!");
  console.log("\n=== Akun Demo (password sama semua: demo1234) ===");
  console.log(`Requester (buat request): ${REQUESTER.email}`);
  DONORS.forEach((d) => console.log(`Donor (${d.bloodType}): ${d.email}`));
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });