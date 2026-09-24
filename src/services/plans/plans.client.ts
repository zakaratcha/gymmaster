import { boundClass } from 'autobind-decorator';

import { api } from '../api/api.service';
import { ApiClient } from '../api/ApiClient';
import type {
  CreatePlannedWorkoutRequest,
  PlanResponse,
  PlansListResponse,
  UpdatePlannedWorkoutRequest
} from './plans.models';

@boundClass
class PlansClient extends ApiClient {
  private static _instance: PlansClient;

  static get instance(): PlansClient {
    return this._instance ?? (this._instance = new this());
  }

  private getPlansUrl(clientId: string): string {
    return `${this.getApiUrl()}/clients/${encodeURIComponent(clientId)}/plans`;
  }

  private getPlanUrl(clientId: string, planId: string): string {
    return `${this.getPlansUrl(clientId)}/${encodeURIComponent(planId)}`;
  }

  async list(clientId: string): Promise<PlansListResponse> {
    return await api.get<PlansListResponse>(this.getPlansUrl(clientId), { cache: { disabled: true } });
  }

  async create(clientId: string, payload: CreatePlannedWorkoutRequest): Promise<PlanResponse> {
    return await api.post<PlanResponse>(this.getPlansUrl(clientId), payload);
  }

  async getById(clientId: string, planId: string): Promise<PlanResponse> {
    return await api.get<PlanResponse>(this.getPlanUrl(clientId, planId), { cache: { disabled: true } });
  }

  async update(clientId: string, planId: string, payload: UpdatePlannedWorkoutRequest): Promise<PlanResponse> {
    return await api.patch<PlanResponse>(this.getPlanUrl(clientId, planId), payload);
  }

  async delete(clientId: string, planId: string): Promise<void> {
    await api.delete<void>(this.getPlanUrl(clientId, planId));
  }
}

export const plansClient = PlansClient.instance;
