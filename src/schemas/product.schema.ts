import { z } from 'zod';
import { paginated } from './common.schema';

export const ReviewSchema = z.object({
  rating: z.number().int().min(1).max(5),
  comment: z.string(),
  date: z.iso.datetime(),
  reviewerName: z.string(),
  reviewerEmail: z.email(),
});

export const ProductSchema = z.object({
  id: z.number().int().positive(),
  title: z.string().min(1),
  description: z.string(),
  category: z.string(),
  price: z.number().positive(),
  discountPercentage: z.number().min(0).max(100),
  rating: z.number().min(0).max(5),
  stock: z.number().int().nonnegative(),
  tags: z.array(z.string()),
  brand: z.string().optional(), // not every product has a brand
  sku: z.string(),
  weight: z.number().positive(),
  dimensions: z.object({ width: z.number(), height: z.number(), depth: z.number() }),
  warrantyInformation: z.string(),
  shippingInformation: z.string(),
  availabilityStatus: z.enum(['In Stock', 'Low Stock', 'Out of Stock']),
  reviews: z.array(ReviewSchema),
  returnPolicy: z.string(),
  minimumOrderQuantity: z.number().int().positive(),
  meta: z.object({
    createdAt: z.iso.datetime(),
    updatedAt: z.iso.datetime(),
    barcode: z.string(),
    qrCode: z.url(),
  }),
  images: z.array(z.url()).min(1),
  thumbnail: z.url(),
});

export const ProductListSchema = paginated('products', ProductSchema);

export const CategorySchema = z.object({ slug: z.string(), name: z.string(), url: z.url() });

export const DeletedProductSchema = ProductSchema.pick({ id: true, title: true }).extend({
  isDeleted: z.literal(true),
  deletedOn: z.iso.datetime(),
});

export type Product = z.infer<typeof ProductSchema>;
export type NewProduct = Pick<Product, 'title' | 'price' | 'category'> & Partial<Product>;
