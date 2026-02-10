import { z } from "zod";

const hexColorRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;

export const senderProfileFormSchema = z
  .object({
    companyName: z.string().optional(),
    displayName: z.string().optional(),
    emailFrom: z.string().optional(),
    address: z.string().optional(),
    taxId: z.string().optional(),
    defaultCurrency: z.string(),
    defaultRate: z.number().min(0).optional(),
  })
  .refine((data) => data.companyName || data.displayName, {
    message: "Either company name or display name is required",
    path: ["companyName"],
  });

export const FONT_FAMILY_OPTIONS = ["system", "serif", "mono"] as const;
export type FontFamilyOption = (typeof FONT_FAMILY_OPTIONS)[number];

export const brandingSchema = z.object({
  logoUrl: z.string().url().optional().or(z.literal("")),
  primaryColor: z.string().regex(hexColorRegex, "Invalid hex color").optional(),
  accentColor: z.string().regex(hexColorRegex, "Invalid hex color").optional(),
  footerText: z.string().max(500).optional().or(z.literal("")),
  fontFamily: z.enum(FONT_FAMILY_OPTIONS).optional().or(z.literal("")),
  invoicePrefix: z
    .string()
    .max(10)
    .regex(/^[A-Za-z0-9]*$/, "Only letters and numbers allowed")
    .optional()
    .or(z.literal("")),
});

export const senderProfileSchema = z.object({
  companyName: z.string().optional(),
  displayName: z.string().optional(),
  emailFrom: z.string().optional(),
  address: z.string().optional(),
  taxId: z.string().optional(),
  defaultCurrency: z.string().default("USD"),
  logoUrl: z.string().optional(),
  primaryColor: z.string().optional(),
  accentColor: z.string().optional(),
  footerText: z.string().optional(),
  fontFamily: z.string().optional(),
  invoicePrefix: z.string().optional(),
  defaultRate: z.number().int().min(0).optional(),
});

export const createSenderProfileSchema = senderProfileSchema.refine(
  (data) =>
    (data.companyName && data.companyName.length > 0) ||
    (data.displayName && data.displayName.length > 0),
  {
    message: "Either company name or display name is required",
    path: ["companyName"],
  }
);

export type SenderProfileFormInput = z.infer<typeof senderProfileFormSchema>;
export type SenderProfileInput = z.infer<typeof senderProfileSchema>;
