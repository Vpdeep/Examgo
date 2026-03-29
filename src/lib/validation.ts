import { z } from 'zod'

/** Normalize user-provided text: trim, strip control chars, cap length (reduces injection & abuse). */
export function sanitizeText(input: string, maxLen: number): string {
  return input
    .trim()
    .replace(/[\u0000-\u001F\u007F]/g, '')
    .slice(0, maxLen)
}

export const ALLOWED_CITIES = [
  'Mumbai', 'Delhi', 'Bangalore', 'Chennai', 'Kolkata', 'Hyderabad', 'Pune', 'Ahmedabad',
  'Jaipur', 'Lucknow', 'Chandigarh', 'Bhopal', 'Patna', 'Nagpur', 'Indore', 'Vadodara',
  'Coimbatore', 'Kochi', 'Visakhapatnam', 'Agra', 'Varanasi', 'Meerut', 'Ranchi', 'Guwahati',
  'Dehradun', 'Allahabad', 'Jodhpur', 'Surat', 'Amritsar', 'Ludhiana', 'Kanpur', 'Nashik',
  'Aurangabad', 'Rajkot', 'Madurai', 'Mysore', 'Tiruchirappalli', 'Bhubaneswar', 'Vijayawada',
  'Jabalpur', 'Raipur', 'Gwalior', 'Thiruvananthapuram', 'Mangalore', 'Hubli', 'Warangal',
  'Guntur', 'Bhilai', 'Bikaner', 'Noida',
] as const

export const ALLOWED_EXAMS = [
  'JEE Mains', 'JEE Advanced', 'NEET UG', 'NEET PG', 'UPSC CSE', 'SSC CGL', 'SSC CHSL',
  'IBPS PO', 'IBPS Clerk', 'SBI PO', 'RRB NTPC', 'Other',
] as const

export const citySchema = z.enum(ALLOWED_CITIES)
export const examSchema = z.enum(ALLOWED_EXAMS)

export const studentRegisterSchema = z.object({
  name: z.string().trim().min(1).max(120).transform((s) => sanitizeText(s, 120)),
  phone: z.string().regex(/^[6-9]\d{9}$/, 'Enter a valid 10-digit Indian mobile number'),
  email: z.string().trim().email().max(254),
  city: citySchema,
  exam_name: examSchema,
  exam_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
})

export const sendOtpSchema = z.object({
  phone: z.string().regex(/^[6-9]\d{9}$/),
  student_id: z.string().uuid(),
})

export const verifyOtpSchema = z.object({
  phone: z.string().regex(/^[6-9]\d{9}$/),
  otp: z.string().regex(/^\d{6}$/),
  student_id: z.string().uuid(),
})

export const institutionRegisterSchema = z.object({
  name: z.string().trim().min(1).max(200),
  phone: z.string().regex(/^[6-9]\d{9}$/),
  type: z.enum(['Coaching', 'College', 'Corporate CSR']),
  contact_email: z.string().trim().email().max(254),
  city: z.string().trim().min(1).max(80).transform((s) => sanitizeText(s, 80)),
})

export const merchantRegisterSchema = z.object({
  business_name: z.string().trim().min(1).max(200),
  contact_phone: z
    .string()
    .trim()
    .transform((p) => p.replace(/\D/g, '').replace(/^91/, '').slice(-10))
    .pipe(z.string().regex(/^[6-9]\d{9}$/, 'Enter a valid 10-digit mobile number')),
  city: z.string().trim().min(1).max(80).transform((s) => sanitizeText(s, 80)),
  category: z.enum(['Food', 'Stay', 'Transport', 'Pharmacy'] as const),
})

export const scholarshipFormSchema = z.object({
  title: z.string().trim().min(1).max(200),
  description: z.string().trim().min(1).max(2000).transform((s) => sanitizeText(s, 2000)),
  type: z.enum(['Coaching', 'College', 'Corporate CSR']),
  stream: z.enum(['Any', 'Engineering', 'Medical', 'Civil Services', 'Banking']),
  min_tier: z.enum(['Merit', 'Bronze', 'Silver', 'Gold', 'Platinum']),
  value: z.string().trim().min(1).max(120),
  deadline: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  contact_email: z.string().trim().email().max(254),
  apply_url: z
    .string()
    .trim()
    .max(2000)
    .optional()
    .default('')
    .refine((s) => s === '' || /^https?:\/\/.+/i.test(s), 'Apply URL must be a valid http(s) URL or empty'),
})

export const dealFormSchema = z.object({
  title: z.string().trim().min(1).max(200),
  description: z.string().trim().min(1).max(2000).transform((s) => sanitizeText(s, 2000)),
  discount_percent: z.coerce.number().int().min(0).max(100),
  valid_until: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
})

export const redeemCodeSchema = z.string().trim().toUpperCase().regex(/^[A-Z0-9]{4,10}$/)
