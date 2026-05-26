import { z } from 'zod'

export const SalarySchema = z.object({
  companyName: z.string().min(1),
  role: z.string(),
  level: z.string(),
  location: z.string(),
  currency: z.string(),
  baseSalary: z.number(),
  bonus: z.number(),
  stockValue: z.number(),
  yearsExp: z.number().optional(),
})

export function normalizeCompanyName(name: string) {
  return name.trim().toLowerCase()
}