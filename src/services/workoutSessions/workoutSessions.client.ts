import { boundClass } from 'autobind-decorator';

import { api } from '../api/api.service';
import { ApiClient } from '../api/ApiClient';
import type {
  CreateWorkoutSessionRequest,
  UpdateWorkoutSessionRequest,
  WorkoutSessionActiveResponse,
  WorkoutSessionLatestCompletedResponse,
  WorkoutSessionResponse
} from './workoutSessions.models';

@boundClass
class WorkoutSessionsClient extends ApiClient {
  private static _instance: WorkoutSessionsClient;

  static get instance(): WorkoutSessionsClient {
    return this._instance ?? (this._instance = new this());
  }

  private getWorkoutSessionsUrl(clientId: string): string {
    return `${this.getApiUrl()}/clients/${encodeURIComponent(clientId)}/workout-sessions`;
  }

  private getWorkoutSessionUrl(clientId: string, sessionId: string): string {
    return `${this.getWorkoutSessionsUrl(clientId)}/${encodeURIComponent(sessionId)}`;
  }

  async create(clientId: string, payload: CreateWorkoutSessionRequest): Promise<WorkoutSessionResponse> {
    return await api.post<WorkoutSessionResponse>(this.getWorkoutSessionsUrl(clientId), payload);
  }

  async getActive(clientId: string): Promise<WorkoutSessionActiveResponse> {
    return await api.get<WorkoutSessionActiveResponse>(`${this.getWorkoutSessionsUrl(clientId)}/active`, {
      cache: { disabled: true }
    });
  }

  async getLatestCompleted(clientId: string): Promise<WorkoutSessionLatestCompletedResponse> {
    return await api.get<WorkoutSessionLatestCompletedResponse>(
      `${this.getWorkoutSessionsUrl(clientId)}/latest-completed`,
      {
        cache: { disabled: true }
      }
    );
  }

  async getById(clientId: string, sessionId: string): Promise<WorkoutSessionResponse> {
    return await api.get<WorkoutSessionResponse>(this.getWorkoutSessionUrl(clientId, sessionId), {
      cache: { disabled: true }
    });
  }

  async update(
    clientId: string,
    sessionId: string,
    payload: UpdateWorkoutSessionRequest
  ): Promise<WorkoutSessionResponse> {
    return await api.patch<WorkoutSessionResponse>(this.getWorkoutSessionUrl(clientId, sessionId), payload);
  }

  async complete(clientId: string, sessionId: string): Promise<WorkoutSessionResponse> {
    return await api.post<WorkoutSessionResponse>(`${this.getWorkoutSessionUrl(clientId, sessionId)}/complete`);
  }
}

export const workoutSessionsClient = WorkoutSessionsClient.instance;
