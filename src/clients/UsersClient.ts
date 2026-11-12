import { BaseClient } from './BaseClient';

export class UsersClient extends BaseClient {
  getById(id: number) {
    return this.get(`/users/${id}`);
  }

  search(q: string) {
    return this.get('/users/search', { params: { q } });
  }

  /** Filter by any (nested) field, e.g. key = "hair.color", value = "Brown" */
  filter(key: string, value: string, limit = 0) {
    return this.get('/users/filter', { params: { key, value, limit } });
  }
}
