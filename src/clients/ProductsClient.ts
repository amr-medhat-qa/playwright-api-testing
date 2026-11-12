import type { NewProduct, Product } from '../schemas/product.schema';
import { BaseClient } from './BaseClient';

export type ListParams = { limit?: number; skip?: number; select?: string; sortBy?: string; order?: 'asc' | 'desc' };

export class ProductsClient extends BaseClient {
  list(params: ListParams = {}) {
    return this.get('/products', { params });
  }

  getById(id: number) {
    return this.get(`/products/${id}`);
  }

  search(q: string, params: ListParams = {}) {
    return this.get('/products/search', { params: { q, ...params } });
  }

  categories() {
    return this.get('/products/categories');
  }

  byCategory(slug: string, params: ListParams = {}) {
    return this.get(`/products/category/${slug}`, { params });
  }

  add(product: NewProduct) {
    return this.post('/products/add', { data: product });
  }

  replace(id: number, product: Partial<Product>) {
    return this.put(`/products/${id}`, { data: product });
  }

  update(id: number, changes: Partial<Product>) {
    return this.patch(`/products/${id}`, { data: changes });
  }

  remove(id: number) {
    return this.delete(`/products/${id}`);
  }
}
