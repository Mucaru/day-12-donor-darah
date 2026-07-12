import { z } from "zod";

export const registerSchema = z.object({
  name: z.string().min(2, "Nama minimal 2 karakter"),
  email: z.string().email("Email tidak valid"),
  password: z.string().min(6, "Password minimal 6 karakter"),
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
  phone: z
    .string()
    .min(9, "Nomor telepon minimal 9 digit")
    .regex(/^(\+62|62|0)8[0-9]{8,12}$/, "Format nomor tidak valid, contoh: 081234567890"),
  city: z.string().min(2, "Kota wajib diisi"),
  latitude: z.number(),
  longitude: z.number(),
});

export type RegisterInput = z.infer<typeof registerSchema>;

export const loginSchema = z.object({
  email: z.string().email("Email tidak valid"),
  password: z.string().min(1, "Password wajib diisi"),
});

export type LoginInput = z.infer<typeof loginSchema>;