import { z } from "zod";

export const registerSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  role: z.enum(["user", "admin"]).optional(), // default handled in Mongoose model
});

export const loginSchema = z.object({
  email: z.string().email("Invalid email"),
  password: z.string().min(1, "Password is required"),
});

export const editUserSchema = z.object({
  name: z.string().optional(),
  password: z.string().optional(),
  profile_pic: z.string().nullable().optional(),
  address: z
    .object({
      province: z.string().optional(),
      district: z.string().optional(),
      city: z.string().optional(),
      state: z.string().optional(),
      ward: z.string().optional(),
    })
    .optional(),
});

// Optional: Infer Types (if needed elsewhere)
export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type EditUserInput = z.infer<typeof editUserSchema>;
