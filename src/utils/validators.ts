import { z } from 'zod'

export const leadSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  email: z.string().email('Valid email required'),
  phone: z.string().optional(),
  state: z.string().min(1, 'State is required'),
  event_date: z.string().optional(),
  service_interest: z.array(z.string()).min(1, 'Select at least one service'),
  message: z.string().optional(),
})
export type LeadFormData = z.infer<typeof leadSchema>

export const contactSchema = z.object({
  from_name: z.string().min(2, 'Name is required'),
  from_email: z.string().email('Valid email required'),
  from_phone: z.string().optional(),
  event_date: z.string().optional(),
  message: z.string().min(10, 'Please write a brief message (min 10 characters)'),
})
export type ContactFormData = z.infer<typeof contactSchema>

export const loginSchema = z.object({
  email: z.string().email('Valid email required'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})
export type LoginFormData = z.infer<typeof loginSchema>

export const registerSchema = z.object({
  full_name: z.string().min(2, 'Name is required'),
  email: z.string().email('Valid email required'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  role: z.enum(['customer', 'vendor']),
})
export type RegisterFormData = z.infer<typeof registerSchema>

export const vendorProfileSchema = z.object({
  business_name: z.string().min(2, 'Business name is required'),
  category: z.enum(['photographer', 'videographer', 'decor', 'music']),
  bio: z.string().max(800, 'Bio must be under 800 characters').optional(),
  state: z.string().min(1, 'State is required'),
  city: z.string().optional(),
  phone: z.string().optional(),
  website: z.string().url('Enter a valid URL').optional().or(z.literal('')),
  instagram_handle: z.string().optional(),
  starting_price: z.coerce.number().min(0).optional(),
  price_unit: z.enum(['event', 'hour', 'package']).default('event'),
})
export type VendorProfileFormData = z.infer<typeof vendorProfileSchema>
