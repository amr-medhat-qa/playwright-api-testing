import { BaseClient } from './BaseClient';

export class AuthClient extends BaseClient {
  login(username: string, password: string, expiresInMins?: number) {
    return this.post('/auth/login', { data: { username, password, expiresInMins } });
  }

  me(token?: string) {
    return this.get('/auth/me', { token });
  }

  refresh(refreshToken: string, expiresInMins?: number) {
    return this.post('/auth/refresh', { data: { refreshToken, expiresInMins } });
  }
}
