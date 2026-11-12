import type { APIRequestContext, APIResponse } from '@playwright/test';

type Params = Record<string, string | number | boolean>;
type Options = { params?: Params; data?: unknown; token?: string };

/** Shared HTTP helpers: auth header, query params and JSON body handling. */
export abstract class BaseClient {
  constructor(protected readonly request: APIRequestContext) {}

  protected get(url: string, opts: Options = {}): Promise<APIResponse> {
    return this.request.get(url, this.build(opts));
  }

  protected post(url: string, opts: Options = {}): Promise<APIResponse> {
    return this.request.post(url, this.build(opts));
  }

  protected put(url: string, opts: Options = {}): Promise<APIResponse> {
    return this.request.put(url, this.build(opts));
  }

  protected patch(url: string, opts: Options = {}): Promise<APIResponse> {
    return this.request.patch(url, this.build(opts));
  }

  protected delete(url: string, opts: Options = {}): Promise<APIResponse> {
    return this.request.delete(url, this.build(opts));
  }

  private build({ params, data, token }: Options) {
    return {
      params,
      data,
      headers: {
        ...(data !== undefined ? { 'Content-Type': 'application/json' } : {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    };
  }
}
