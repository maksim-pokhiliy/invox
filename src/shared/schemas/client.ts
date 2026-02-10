import { z } from "zod";

export const clientFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.email("Invalid email address"),
  defaultRate: z.number().min(0).optional(),
});

export const createClientSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.email("Invalid email address"),
  defaultRate: z.number().int().min(0).optional(),
});

export const updateClientSchema = createClientSchema.partial();

export type ClientFormInput = z.infer<typeof clientFormSchema>;
export type CreateClientInput = z.infer<typeof createClientSchema>;
export type UpdateClientInput = z.infer<typeof updateClientSchema>;
