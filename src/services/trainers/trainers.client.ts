import { boundClass } from 'autobind-decorator';

import { api } from '../api/api.service';
import { ApiClient } from '../api/ApiClient';
import type {
  AdminTrainerResponse,
  AdminTrainersResponse,
  CreateTrainerRequest,
  ResetTrainerPasswordRequest,
  UpdateTrainerStatusRequest
} from './trainers.models';

@boundClass
class AdminTrainersClient extends ApiClient {
  private static _instance: AdminTrainersClient;

  static get instance(): AdminTrainersClient {
    return this._instance ?? (this._instance = new this());
  }

  private getTrainersUrl(): string {
    return `${this.getApiUrl()}/admin/trainers`;
  }

  private getTrainerStatusUrl(id: string): string {
    return `${this.getTrainersUrl()}/${encodeURIComponent(id)}/status`;
  }

  private getTrainerPasswordUrl(id: string): string {
    return `${this.getTrainersUrl()}/${encodeURIComponent(id)}/password`;
  }

  async list(): Promise<AdminTrainersResponse> {
    return await api.get<AdminTrainersResponse>(this.getTrainersUrl(), { cache: { disabled: true } });
  }

  async create(payload: CreateTrainerRequest): Promise<AdminTrainerResponse> {
    return await api.post<AdminTrainerResponse>(this.getTrainersUrl(), payload, { cache: { disabled: true } });
  }

  async setStatus(id: string, payload: UpdateTrainerStatusRequest): Promise<AdminTrainerResponse> {
    return await api.patch<AdminTrainerResponse>(this.getTrainerStatusUrl(id), payload);
  }

  async resetPassword(id: string, payload: ResetTrainerPasswordRequest): Promise<void> {
    await api.put<void>(this.getTrainerPasswordUrl(id), payload);
  }
}

export const adminTrainersClient = AdminTrainersClient.instance;
