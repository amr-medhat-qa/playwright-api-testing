import { test, expect } from '../src/fixtures/api.fixtures';
import { UserListSchema, UserSchema } from '../src/schemas/user.schema';
import { expectSchema } from '../src/utils/expectSchema';

test.describe('Users', () => {
  test('get user by id matches the contract @smoke @contract', async ({ users }) => {
    const res = await users.getById(1);
    expect(res.status()).toBe(200);

    const user = expectSchema(UserSchema, await res.json());
    expect(user.id).toBe(1);
  });

  test('search users by name', async ({ users }) => {
    const body = expectSchema(UserListSchema, await (await users.search('John')).json());

    expect(body.users.length).toBeGreaterThan(0);
    for (const u of body.users) {
      const fullName = `${u.firstName} ${u.lastName} ${u.username} ${u.email}`.toLowerCase();
      expect(fullName).toContain('john');
    }
  });

  const filters = [
    { key: 'hair.color', value: 'Brown', pick: (u: { hair: { color: string } }) => u.hair.color },
    { key: 'gender', value: 'female', pick: (u: { gender: string }) => u.gender },
    { key: 'role', value: 'admin', pick: (u: { role: string }) => u.role },
  ];

  for (const { key, value, pick } of filters) {
    test(`filter users by ${key} = ${value}`, async ({ users }) => {
      const body = expectSchema(UserListSchema, await (await users.filter(key, value)).json());

      expect(body.users.length).toBeGreaterThan(0);
      expect(body.total).toBe(body.users.length);
      for (const u of body.users) expect(pick(u as never)).toBe(value);
    });
  }

  test('get non-existing user returns 404', async ({ users }) => {
    const res = await users.getById(99999);
    expect(res.status()).toBe(404);
  });
});
