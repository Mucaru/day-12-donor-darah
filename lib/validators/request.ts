import { z } from "zod";

export const createRequestSchema = z.object({
  bloodType: z.enum([
    "A_POS",
    "A_NEG",
    "B_POS",
    "B_NEG",
    "AB_POS",
    "AB_NEG",
    "O_POS",
    "O_NEG",
  ]),
  urgencyLevel: z.enum(["NORMAL", "URGENT", "CRITICAL"]),
  hospitalName: z.string().min(3, "Nama rumah sakit wajib diisi"),
  description: z
    .string()
    .min(10, "Deskripsi minimal 10 karakter")
    .max(500, "Deskripsi maksimal 500 karakter"),
  latitude: z.number(),
  longitude: z.number(),
  expiresInHours: z.number().min(1).max(168), // maks 7 hari
});

export type CreateRequestInput = z.infer<typeof createRequestSchema>;