import { z } from "zod";

export const businessSchema = z.object({
  businessName: z.string().min(1, "Enter the business name"),
  businessAddress: z.string().optional(),
});

export const incidentSchema = z.object({
  category: z.string().min(1, "Choose a category"),
  incidentDate: z.string().optional(),
  amount: z.string().optional(),
  description: z.string().min(20, "Describe what happened (at least 20 characters)"),
});

export const complainantSchema = z.object({
  fullName: z.string().min(2, "Enter your full name"),
  email: z.string().email("Enter a valid email address"),
  phone: z.string().optional(),
  consent: z.literal(true, {
    errorMap: () => ({ message: "You must give your consent to continue" }),
  }),
});

export const complaintSchema = businessSchema.merge(incidentSchema).merge(
  complainantSchema.omit({ consent: true })
);

export type BusinessFields = z.infer<typeof businessSchema>;
export type IncidentFields = z.infer<typeof incidentSchema>;
export type ComplainantFields = z.infer<typeof complainantSchema>;
export type ComplaintFields = z.infer<typeof complaintSchema>;
