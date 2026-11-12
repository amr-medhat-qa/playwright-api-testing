import { test, expect } from '../src/fixtures/api.fixtures';
import { CartListSchema, CartSchema, type Cart } from '../src/schemas/cart.schema';
import { expectSchema } from '../src/utils/expectSchema';

/** Business rules every cart must satisfy, regardless of where it came from. */
function expectCartTotalsConsistent(cart: Cart) {
  for (const line of cart.products) {
    expect(line.total, `line total for product ${line.id}`).toBeCloseTo(line.price * line.quantity, 2);
  }
  const sum = cart.products.reduce((acc, l) => acc + l.total, 0);
  expect(cart.total).toBeCloseTo(sum, 2);
  expect(cart.totalProducts).toBe(cart.products.length);
  expect(cart.totalQuantity).toBe(cart.products.reduce((acc, l) => acc + l.quantity, 0));
  expect(cart.discountedTotal).toBeLessThanOrEqual(cart.total);
}

test.describe('Carts', () => {
  test('get cart by id matches the contract and totals add up @smoke @contract', async ({ carts }) => {
    const res = await carts.getById(1);
    expect(res.status()).toBe(200);

    const cart = expectSchema(CartSchema, await res.json());
    expectCartTotalsConsistent(cart);
  });

  test('carts of a user all belong to that user @contract', async ({ carts }) => {
    const userId = 33;
    const body = expectSchema(CartListSchema, await (await carts.byUser(userId)).json());

    expect(body.carts.length).toBeGreaterThan(0);
    for (const cart of body.carts) {
      expect(cart.userId).toBe(userId);
      expectCartTotalsConsistent(cart);
    }
  });

  test('add cart calculates line totals, quantities and grand total', async ({ carts }) => {
    const lines = [
      { id: 1, quantity: 2 },
      { id: 5, quantity: 1 },
      { id: 10, quantity: 3 },
    ];

    const res = await carts.add(1, lines);
    expect(res.status()).toBe(201);

    const cart = expectSchema(CartSchema, await res.json());
    expect(cart.userId).toBe(1);
    expect(cart.products.map((p) => ({ id: p.id, quantity: p.quantity }))).toEqual(lines);
    expect(cart.totalQuantity).toBe(6);
    expectCartTotalsConsistent(cart);
  });

  test('update cart with merge keeps existing products', async ({ carts }) => {
    const original = expectSchema(CartSchema, await (await carts.getById(1)).json());

    const res = await carts.update(1, [{ id: 1, quantity: 1 }], true);
    expect(res.status()).toBe(200);
    const updated = expectSchema(CartSchema, await res.json());

    const originalIds = original.products.map((p) => p.id);
    const updatedIds = updated.products.map((p) => p.id);
    expect(updatedIds).toEqual(expect.arrayContaining(originalIds));
    expect(updatedIds).toContain(1);
  });

  test('get non-existing cart returns 404', async ({ carts }) => {
    const res = await carts.getById(99999);
    expect(res.status()).toBe(404);
  });
});
