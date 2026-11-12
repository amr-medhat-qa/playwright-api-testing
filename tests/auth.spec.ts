import { test, expect } from '../src/fixtures/api.fixtures';
import { LoginResponseSchema, RefreshResponseSchema } from '../src/schemas/auth.schema';
import { ErrorSchema } from '../src/schemas/common.schema';
import { UserSchema } from '../src/schemas/user.schema';
import { credentials } from '../src/data/testData';
import { expectSchema } from '../src/utils/expectSchema';

const decodeJwt = (jwt: string) => JSON.parse(Buffer.from(jwt.split('.')[1], 'base64url').toString());

test.describe('Auth', () => {
  test('login with valid credentials returns user and JWT tokens @smoke @contract', async ({ auth }) => {
    const res = await auth.login(credentials.valid.username, credentials.valid.password);
    expect(res.status()).toBe(200);

    const body = expectSchema(LoginResponseSchema, await res.json());
    expect(body.username).toBe(credentials.valid.username);
  });

  test('access token payload matches the logged-in user and requested expiry', async ({ auth }) => {
    const res = await auth.login(credentials.valid.username, credentials.valid.password, 5);
    const body = expectSchema(LoginResponseSchema, await res.json());

    const payload = decodeJwt(body.accessToken);
    expect(payload).toMatchObject({ id: body.id, username: body.username });
    expect(payload.exp - payload.iat).toBe(5 * 60);
  });

  test('get current user with bearer token @smoke', async ({ auth, accessToken }) => {
    const res = await auth.me(accessToken);
    expect(res.status()).toBe(200);

    const me = expectSchema(UserSchema, await res.json());
    expect(me.username).toBe(credentials.valid.username);
  });

  test('refresh token issues a new valid access token', async ({ auth }) => {
    const login = await (await auth.login(credentials.valid.username, credentials.valid.password)).json();

    const res = await auth.refresh(login.refreshToken);
    expect(res.status()).toBe(200);
    const tokens = expectSchema(RefreshResponseSchema, await res.json());

    const me = await auth.me(tokens.accessToken);
    expect(me.status()).toBe(200);
  });

  test.describe('negative', () => {
    const invalidLogins = [
      { name: 'wrong password', username: credentials.valid.username, password: 'wrong-pass' },
      { name: 'unknown user', username: 'no-such-user-qa', password: 'whatever' },
    ];

    for (const { name, username, password } of invalidLogins) {
      test(`login fails with ${name}`, async ({ auth }) => {
        const res = await auth.login(username, password);
        expect(res.status()).toBe(400);
        expect(expectSchema(ErrorSchema, await res.json()).message).toBe('Invalid credentials');
      });
    }

    test('protected endpoint without token returns 401', async ({ auth }) => {
      const res = await auth.me();
      expect(res.status()).toBe(401);
      expectSchema(ErrorSchema, await res.json());
    });

    test('protected endpoint with a malformed token returns 401', async ({ auth }) => {
      const res = await auth.me('not-a-jwt');
      expect(res.status()).toBe(401);
      expectSchema(ErrorSchema, await res.json());
    });

    /**
     * KNOWN BUG: a well-formed JWT with an invalid signature crashes the endpoint
     * (500 "invalid signature") instead of returning 401 like other invalid tokens.
     * `test.fail()` keeps the suite green while the bug exists and turns red as soon as
     * it is fixed — a reminder to remove the marker.
     */
    test('protected endpoint with a tampered signature returns 401', async ({ auth, accessToken }) => {
      test.fail(true, 'Known API bug: tampered signature returns 500 instead of 401');
      test.info().annotations.push({ type: 'bug', description: 'Tampered JWT signature → 500 instead of 401' });

      const [header, payload, signature] = accessToken.split('.');
      const tampered = [header, payload, [...signature].reverse().join('')].join('.');
      const res = await auth.me(tampered);
      expect(res.status()).toBe(401);
    });
  });
});
