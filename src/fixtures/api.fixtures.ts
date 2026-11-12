import { test as base, request as playwrightRequest } from '@playwright/test';
import { AuthClient } from '../clients/AuthClient';
import { CartsClient } from '../clients/CartsClient';
import { ProductsClient } from '../clients/ProductsClient';
import { UsersClient } from '../clients/UsersClient';
import { credentials } from '../data/testData';

type TestFixtures = {
  auth: AuthClient;
  products: ProductsClient;
  carts: CartsClient;
  users: UsersClient;
};

type WorkerFixtures = {
  /** Logs in once per worker and shares the access token across that worker's tests. */
  accessToken: string;
};

export const test = base.extend<TestFixtures, WorkerFixtures>({
  auth: async ({ request }, use) => use(new AuthClient(request)),
  products: async ({ request }, use) => use(new ProductsClient(request)),
  carts: async ({ request }, use) => use(new CartsClient(request)),
  users: async ({ request }, use) => use(new UsersClient(request)),

  accessToken: [
    // Playwright requires an object pattern as the first argument, even when no fixtures are used
    // eslint-disable-next-line no-empty-pattern
    async ({}, use, workerInfo) => {
      const ctx = await playwrightRequest.newContext({ baseURL: workerInfo.project.use.baseURL });
      const res = await new AuthClient(ctx).login(credentials.valid.username, credentials.valid.password, 60);
      if (!res.ok()) throw new Error(`Login failed in fixture: ${res.status()} ${await res.text()}`);
      const { accessToken } = await res.json();
      await use(accessToken);
      await ctx.dispose();
    },
    { scope: 'worker' },
  ],
});

export { expect } from '@playwright/test';
