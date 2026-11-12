import { z } from 'zod';
import { paginated } from './common.schema';

export const CartItemSchema = z.object({
  id: z.number().int().positive(),
  title: z.string(),
  price: z.number().positive(),
  quantity: z.number().int().positive(),
  total: z.number().nonnegative(),
  discountPercentage: z.number().min(0).max(100),
  discountedTotal: z.number().nonnegative().optional(),
  discountedPrice: z.number().nonnegative().optional(),
  thumbnail: z.url(),
});

export const CartSchema = z.object({
  id: z.number().int().positive(),
  products: z.array(CartItemSchema),
  total: z.number().nonnegative(),
  discountedTotal: z.number().nonnegative(),
  userId: z.number().int().positive(),
  totalProducts: z.number().int().nonnegative(),
  totalQuantity: z.number().int().nonnegative(),
});

export const CartListSchema = paginated('carts', CartSchema);

export type Cart = z.infer<typeof CartSchema>;
