import { api } from './api.service';

export abstract class Client {
  protected getBaseUrl(): string {
    return api.baseUrl;
  }

  protected getApiUrl(): string {
    return `${this.getBaseUrl()}/api`;
  }
}
