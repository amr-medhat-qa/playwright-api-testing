import { test, expect } from '../src/fixtures/api.fixtures';
import { ErrorSchema } from '../src/schemas/common.schema';
import { CategorySchema, DeletedProductSchema, ProductListSchema, ProductSchema } from '../src/schemas/product.schema';
import { knownProduct, uniqueTitle } from '../src/data/testData';
import { expectSchema } from '../src/utils/expectSchema';
import { z } from 'zod';

test.describe('Products - read', () => {
  test('get product by id matches the contract @smoke @contract', async ({ products }) => {
    const res = await products.getById(knownProduct.id);
    expect(res.status()).toBe(200);

    const product = expectSchema(ProductSchema, await res.json());
    expect(product).toMatchObject(knownProduct);
  });

  test('every product in the first page matches the contract @contract', async ({ products }) => {
    const res = await products.list({ limit: 30 });
    const body = expectSchema(ProductListSchema, await res.json());
    expect(body.products).toHaveLength(30);
  });

  test('pagination returns the requested slice', async ({ products }) => {
    const all = expectSchema(ProductListSchema, await (await products.list({ limit: 10 })).json());
    const page = expectSchema(ProductListSchema, await (await products.list({ limit: 3, skip: 4 })).json());

    expect(page).toMatchObject({ limit: 3, skip: 4, total: all.total });
    expect(page.products.map((p) => p.id)).toEqual(all.products.slice(4, 7).map((p) => p.id));
  });

  test('select returns only the requested fields', async ({ products }) => {
    const res = await products.list({ limit: 5, select: 'title,price' });
    const { products: items } = await res.json();

    for (const item of items) {
      expect(Object.keys(item).sort()).toEqual(['id', 'price', 'title']);
    }
  });

  for (const order of ['asc', 'desc'] as const) {
    test(`sort by price ${order}`, async ({ products }) => {
      const res = await products.list({ limit: 20, sortBy: 'price', order, select: 'price' });
      const prices: number[] = (await res.json()).products.map((p: { price: number }) => p.price);

      const expected = [...prices].sort((a, b) => (order === 'asc' ? a - b : b - a));
      expect(prices).toEqual(expected);
    });
  }

  const searchTerms = ['phone', 'laptop', 'mascara'];
  for (const term of searchTerms) {
    test(`search "${term}" returns only matching products`, async ({ products }) => {
      const body = expectSchema(ProductListSchema, await (await products.search(term)).json());

      expect(body.products.length).toBeGreaterThan(0);
      for (const p of body.products) {
        const haystack = `${p.title} ${p.description} ${p.category} ${p.tags.join(' ')}`.toLowerCase();
        expect(haystack, `product ${p.id} should match "${term}"`).toContain(term);
      }
    });
  }

  test('search with no matches returns an empty list', async ({ products }) => {
    const body = expectSchema(ProductListSchema, await (await products.search('zzzz-no-match-qa')).json());
    expect(body).toMatchObject({ products: [], total: 0 });
  });

  test('categories list matches the contract and every category is reachable', async ({ products }) => {
    const categories = expectSchema(z.array(CategorySchema).min(1), await (await products.categories()).json());

    const sample = categories.slice(0, 3);
    for (const { slug } of sample) {
      const body = expectSchema(ProductListSchema, await (await products.byCategory(slug)).json());
      expect(body.products.length).toBeGreaterThan(0);
      expect(body.products.every((p) => p.category === slug)).toBe(true);
    }
  });

  for (const id of [0, 99999]) {
    test(`get non-existing product id ${id} returns 404`, async ({ products }) => {
      const res = await products.getById(id);
      expect(res.status()).toBe(404);
      expect(expectSchema(ErrorSchema, await res.json()).message).toBe(`Product with id '${id}' not found`);
    });
  }
});

/**
 * DummyJSON simulates writes: responses reflect the change but nothing is persisted on the server.
 * Tests therefore validate the response of each write call, not a follow-up GET.
 */
test.describe('Products - write (simulated)', () => {
  test('add product returns the new product with an id @smoke', async ({ products }) => {
    const newProduct = { title: uniqueTitle(), price: 19.99, category: 'kitchen-accessories' };

    const res = await products.add(newProduct);
    expect(res.status()).toBe(201);
    const body = await res.json();

    expect(body).toMatchObject(newProduct);
    expect(body.id).toEqual(expect.any(Number));
  });

  test('PATCH updates only the given fields', async ({ products }) => {
    const original = expectSchema(ProductSchema, await (await products.getById(knownProduct.id)).json());

    const res = await products.update(knownProduct.id, { price: 1.23 });
    expect(res.status()).toBe(200);
    const body = await res.json();

    expect(body).toMatchObject({ id: original.id, title: original.title, price: 1.23 });
  });

  test('PUT replaces the given fields', async ({ products }) => {
    const title = uniqueTitle('Renamed');
    const res = await products.replace(knownProduct.id, { title });
    expect(res.status()).toBe(200);
    expect(await res.json()).toMatchObject({ id: knownProduct.id, title });
  });

  test('DELETE marks the product as deleted', async ({ products }) => {
    const res = await products.remove(knownProduct.id);
    expect(res.status()).toBe(200);

    const body = expectSchema(DeletedProductSchema, await res.json());
    expect(body.id).toBe(knownProduct.id);
  });

  test('DELETE non-existing product returns 404', async ({ products }) => {
    const res = await products.remove(99999);
    expect(res.status()).toBe(404);
  });
});
