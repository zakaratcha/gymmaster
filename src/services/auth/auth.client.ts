import { boundClass } from 'autobind-decorator';

import { api } from '../api/api.service';
import { ApiClient } from '../api/ApiClient';
import type { AuthResult, ChangePasswordRequest, CurrentTrainerResponse, LoginRequest } from './auth.models';

type CollectCookiesConfig = {
  collectCookies?: Map<string, string>;
};

@boundClass
class AuthClient extends ApiClient {
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

  async login(payload: LoginRequest, config: CollectCookiesConfig = {}): Promise<AuthResult> {
    return await api.post<AuthResult>(this.getLoginUrl(), payload, config);
  }

  async logout(): Promise<void> {
    await api.post<void>(this.getLogoutUrl());
  }

  private getCurrentUserPasswordUrl(): string {
    return `${this.getCurrentUserUrl()}/password`;
  }

  async changePassword(payload: ChangePasswordRequest, config: CollectCookiesConfig = {}): Promise<void> {
    await api.put<void>(this.getCurrentUserPasswordUrl(), payload, config);
  }

  async getCurrentUser(): Promise<CurrentTrainerResponse> {
    return await api.get<CurrentTrainerResponse>(this.getCurrentUserUrl(), { cache: { disabled: true } });
  }
}

export const authClient = AuthClient.instance;
