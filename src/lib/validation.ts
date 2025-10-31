import { z } from 'zod';

// Auth validation schemas
export const signupSchema = z.object({
  name: z.string()
    .trim()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name must be less than 100 characters'),
  email: z.string()
    .email('Invalid email address')
    .max(255, 'Email must be less than 255 characters'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .max(72, 'Password must be less than 72 characters'),
  address: z.string()
    .trim()
    .min(10, 'Address must be at least 10 characters')
    .max(500, 'Address must be less than 500 characters'),
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

// Profile validation schema
export const profileSchema = z.object({
  name: z.string()
    .trim()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name must be less than 100 characters'),
  email: z.string()
    .email('Invalid email address')
    .max(255, 'Email must be less than 255 characters'),
  address: z.string()
    .trim()
    .min(10, 'Address must be at least 10 characters')
    .max(500, 'Address must be less than 500 characters'),
});

// Product validation schema
export const productSchema = z.object({
  name: z.string()
    .trim()
    .min(1, 'Product name is required')
    .max(100, 'Product name must be less than 100 characters'),
  category: z.enum(['protein_bars', 'dessert_bars', 'chocolates'], {
    errorMap: () => ({ message: 'Invalid category' }),
  }),
  price: z.number()
    .positive('Price must be positive')
    .max(100000, 'Price must be less than ₹100,000'),
  stock: z.number()
    .int('Stock must be a whole number')
    .min(0, 'Stock cannot be negative')
    .max(100000, 'Stock must be less than 100,000'),
  nutrition: z.string()
    .trim()
    .min(1, 'Nutrition info is required')
    .max(500, 'Nutrition info must be less than 500 characters'),
  description: z.string()
    .max(2000, 'Description must be less than 2000 characters')
    .optional(),
  protein: z.string()
    .max(50, 'Protein info must be less than 50 characters')
    .optional(),
  sugar: z.string()
    .max(50, 'Sugar info must be less than 50 characters')
    .optional(),
  calories: z.string()
    .max(50, 'Calories info must be less than 50 characters')
    .optional(),
  weight: z.string()
    .max(50, 'Weight info must be less than 50 characters')
    .optional(),
  shelf_life: z.string()
    .max(100, 'Shelf life info must be less than 100 characters')
    .optional(),
  allergens: z.string()
    .max(200, 'Allergens info must be less than 200 characters')
    .optional(),
});
