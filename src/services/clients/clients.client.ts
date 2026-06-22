import { boundClass } from 'autobind-decorator';

import { api } from '../api/api.service';
import { ApiClient } from '../api/ApiClient';
import type { ClientResponse, ClientsListResponse, CreateClientRequest, UpdateClientRequest } from './clients.models';

@boundClass
class ClientsClient extends ApiClient {
  private static _instance: ClientsClient;

  static get instance(): ClientsClient {
    return this._instance ?? (this._instance = new this());
  }

  private getClientsUrl(): string {
    return `${this.getApiUrl()}/clients`;
  }

  private getClientUrl(id: string): string {
    return `${this.getClientsUrl()}/${id}`;
  }

  async list(): Promise<ClientsListResponse> {
    return await api.get<ClientsListResponse>(this.getClientsUrl(), { cache: { disabled: true } });
  }

  async create(payload: CreateClientRequest): Promise<ClientResponse> {
    return await api.post<ClientResponse>(this.getClientsUrl(), payload);
  }

  async getById(id: string): Promise<ClientResponse> {
    return await api.get<ClientResponse>(this.getClientUrl(id), { cache: { disabled: true } });
  }

  async update(id: string, payload: UpdateClientRequest): Promise<ClientResponse> {
    return await api.patch<ClientResponse>(this.getClientUrl(id), payload);
  }

  async delete(id: string): Promise<void> {
    await api.delete<void>(this.getClientUrl(id));
  }
}

export const clientsClient = ClientsClient.instance;
