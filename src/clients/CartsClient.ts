import { BaseClient } from './BaseClient';

export type CartLine = { id: number; quantity: number };

export class CartsClient extends BaseClient {
  getById(id: number) {
    return this.get(`/carts/${id}`);
  }

  byUser(userId: number) {
    return this.get(`/carts/user/${userId}`);
  }

  add(userId: number, products: CartLine[]) {
    return this.post('/carts/add', { data: { userId, products } });
  }

  update(id: number, products: CartLine[], merge = true) {
    return this.put(`/carts/${id}`, { data: { merge, products } });
  }
}
