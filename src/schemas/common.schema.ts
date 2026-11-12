import { z } from 'zod';

/** Every error body from DummyJSON looks like { "message": "..." } */
export const ErrorSchema = z.object({ message: z.string().min(1) });

/** Wraps an item schema into DummyJSON's paginated list shape: { <key>: [...], total, skip, limit } */
export const paginated = <K extends string, T extends z.ZodType>(key: K, item: T) =>
  z.object({
    [key]: z.array(item),
    total: z.number().int().nonnegative(),
    skip: z.number().int().nonnegative(),
    limit: z.number().int().nonnegative(),
  } as { [P in K]: z.ZodArray<T> } & {
    total: z.ZodNumber;
    skip: z.ZodNumber;
    limit: z.ZodNumber;
  });

export const JwtSchema = z.string().regex(/^[\w-]+\.[\w-]+\.[\w-]+$/, 'must be a JWT (header.payload.signature)');
