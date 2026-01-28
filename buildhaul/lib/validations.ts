import { z } from 'zod'

// Auth schemas
export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
})

export const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string(),
  fullName: z.string().min(2, 'Full name is required'),
  phone: z.string().min(10, 'Valid phone number required'),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
})

// Company schemas
export const companySchema = z.object({
  name: z.string().min(2, 'Company name required'),
  businessType: z.enum(['general_contractor', 'material_supplier', 'mining', 'developer', 'other']),
  address: z.string().min(5, 'Address required'),
  city: z.string().min(2, 'City required'),
  state: z.string().length(2, 'Use 2-letter state code'),
  zip: z.string().regex(/^\d{5}(-\d{4})?$/, 'Valid ZIP code required'),
  phone: z.string().min(10, 'Valid phone number required'),
  email: z.string().email('Valid email required'),
})

// Driver schemas
export const driverSchema = z.object({
  companyName: z.string().optional(),
  address: z.string().min(5, 'Address required'),
  city: z.string().min(2, 'City required'),
  state: z.string().length(2, 'Use 2-letter state code'),
  zip: z.string().regex(/^\d{5}(-\d{4})?$/, 'Valid ZIP code required'),
  cdlNumber: z.string().min(5, 'CDL number required'),
  cdlState: z.string().length(2, 'Use 2-letter state code'),
  cdlExpiry: z.string().refine((date) => new Date(date) > new Date(), {
    message: 'CDL must not be expired',
  }),
  yearsExperience: z.number().min(0).max(50),
  serviceRadiusMiles: z.number().min(10).max(500),
})

// Truck schemas
export const truckSchema = z.object({
  truckType: z.enum(['lowboy', 'end_dump', 'belly_dump', 'side_dump', 'flatbed', 'water_truck', 'other']),
  make: z.string().min(2, 'Make required'),
  model: z.string().min(1, 'Model required'),
  year: z.number().min(1990).max(new Date().getFullYear() + 1),
  licensePlate: z.string().min(2, 'License plate required'),
  capacityTons: z.number().min(1).max(100),
  dotNumber: z.string().optional(),
  mcNumber: z.string().optional(),
  insuranceExpiry: z.string().optional(),
})

// Load schemas
export const loadSchema = z.object({
  materialType: z.enum(['aggregate', 'sand', 'gravel', 'asphalt', 'concrete', 'dirt', 'rock', 'topsoil', 'base_course', 'rip_rap', 'other']),
  materialDescription: z.string().optional(),
  weightTons: z.number().min(0.1).max(1000),
  truckTypeRequired: z.enum(['lowboy', 'end_dump', 'belly_dump', 'side_dump', 'flatbed', 'water_truck', 'other']),
  trucksNeeded: z.number().min(1).max(50),
  pickupLocationName: z.string().min(2, 'Pickup location name required'),
  pickupAddress: z.string().min(5, 'Pickup address required'),
  pickupCity: z.string().min(2, 'City required'),
  pickupState: z.string().length(2, 'Use 2-letter state code'),
  pickupZip: z.string().regex(/^\d{5}(-\d{4})?$/, 'Valid ZIP code required'),
  pickupCoordinates: z.string(),
  pickupInstructions: z.string().optional(),
  deliveryLocationName: z.string().min(2, 'Delivery location name required'),
  deliveryAddress: z.string().min(5, 'Delivery address required'),
  deliveryCity: z.string().min(2, 'City required'),
  deliveryState: z.string().length(2, 'Use 2-letter state code'),
  deliveryZip: z.string().regex(/^\d{5}(-\d{4})?$/, 'Valid ZIP code required'),
  deliveryCoordinates: z.string(),
  deliveryInstructions: z.string().optional(),
  distanceMiles: z.number().min(0),
  scheduledDate: z.string().refine((date) => new Date(date) >= new Date(), {
    message: 'Scheduled date must be in the future',
  }),
  pickupTimeStart: z.string(),
  pickupTimeEnd: z.string(),
  pricingType: z.enum(['fixed', 'hourly', 'per_ton', 'bid']),
  rateAmount: z.number().min(0),
  estimatedTotal: z.number().min(0),
  roundTrips: z.number().min(1).max(100),
  urgent: z.boolean().default(false),
  notes: z.string().optional(),
})

// Bid schema
export const bidSchema = z.object({
  amount: z.number().min(1, 'Bid amount must be greater than 0'),
  message: z.string().optional(),
})

// Review schema
export const reviewSchema = z.object({
  rating: z.number().min(1).max(5),
  comment: z.string().max(500).optional(),
})

export type LoginInput = z.infer<typeof loginSchema>
export type RegisterInput = z.infer<typeof registerSchema>
export type CompanyInput = z.infer<typeof companySchema>
export type DriverInput = z.infer<typeof driverSchema>
export type TruckInput = z.infer<typeof truckSchema>
export type LoadInput = z.infer<typeof loadSchema>
export type BidInput = z.infer<typeof bidSchema>
export type ReviewInput = z.infer<typeof reviewSchema>
