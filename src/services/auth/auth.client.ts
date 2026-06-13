import { boundClass } from 'autobind-decorator';

import { api } from '../api/api.service';
import { Client } from '../api/Client';
import type { AuthResult, CurrentTrainerResponse, LoginRequest } from './auth.models';

@boundClass
class AuthClient extends Client {
  private static _instance: AuthClient;

  static get instance(): AuthClient {
    return this._instance ?? (this._instance = new this());
  }

  private getLoginUrl(): string {
    return `${this.getApiUrl()}/login`;
  }

  private getLogoutUrl(): string {
    return `${this.getApiUrl()}/logout`;
  }

  private getCurrentUserUrl(): string {
    return `${this.getApiUrl()}/current-user`;
  }

  async login(payload: LoginRequest): Promise<AuthResult> {
    return await api.post<AuthResult>(this.getLoginUrl(), payload);
  }

  async logout(): Promise<void> {
    await api.post<void>(this.getLogoutUrl());
  }

  async getCurrentUser(): Promise<CurrentTrainerResponse> {
    return await api.get<CurrentTrainerResponse>(this.getCurrentUserUrl(), { cache: { disabled: true } });
  }
}

export const authClient = AuthClient.instance;
