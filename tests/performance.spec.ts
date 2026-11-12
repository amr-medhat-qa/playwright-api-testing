import { test, expect } from '../src/fixtures/api.fixtures';

/**
 * Lightweight response-time guard (not a load test): catches big regressions in key endpoints.
 * Threshold is generous because the API is a shared public service; override with MAX_RESPONSE_MS.
 */
const MAX_MS = Number(process.env.MAX_RESPONSE_MS ?? 3000);

test.describe('Response time', () => {
  const endpoints = ['/products/1', '/products?limit=30', '/carts/1', '/users/1', '/products/search?q=phone'];

  for (const path of endpoints) {
    test(`GET ${path} responds under ${MAX_MS} ms`, async ({ request }) => {
      const start = performance.now();
      const res = await request.get(path);
      const elapsed = Math.round(performance.now() - start);

      test.info().annotations.push({ type: 'response time', description: `${elapsed} ms` });
      expect(res.ok()).toBeTruthy();
      expect(elapsed).toBeLessThan(MAX_MS);
    });
  }
});
