import { api } from './api.service';

export abstract class ApiClient {
  protected getBaseUrl(): string {
    return api.baseUrl;
  }

  protected getApiUrl(): string {
    return `${this.getBaseUrl()}/api`;
  }
}
