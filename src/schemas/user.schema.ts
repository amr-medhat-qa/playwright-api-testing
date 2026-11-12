import { z } from 'zod';
import { paginated } from './common.schema';

export const UserSchema = z.object({
  id: z.number().int().positive(),
  firstName: z.string(),
  lastName: z.string(),
  age: z.number().int().positive(),
  gender: z.enum(['male', 'female']),
  email: z.email(),
  phone: z.string(),
  username: z.string(),
  birthDate: z.string(),
  image: z.url(),
  bloodGroup: z.string(),
  height: z.number().positive(),
  weight: z.number().positive(),
  eyeColor: z.string(),
  hair: z.object({ color: z.string(), type: z.string() }),
  address: z.object({
    address: z.string(),
    city: z.string(),
    state: z.string(),
    postalCode: z.string(),
    country: z.string(),
    coordinates: z.object({ lat: z.number().min(-90).max(90), lng: z.number().min(-180).max(180) }),
  }),
  company: z.object({ name: z.string(), title: z.string(), department: z.string() }),
  role: z.enum(['admin', 'moderator', 'user']),
});

export const UserListSchema = paginated('users', UserSchema);

export type User = z.infer<typeof UserSchema>;
