import { z } from 'zod';
import { JwtSchema } from './common.schema';

export const LoginResponseSchema = z.object({
  id: z.number().int().positive(),
  username: z.string(),
  email: z.email(),
  firstName: z.string(),
  lastName: z.string(),
  gender: z.enum(['male', 'female']),
  image: z.url(),
  accessToken: JwtSchema,
  refreshToken: JwtSchema,
});

export const RefreshResponseSchema = z.object({
  accessToken: JwtSchema,
  refreshToken: JwtSchema,
});

export type LoginResponse = z.infer<typeof LoginResponseSchema>;
