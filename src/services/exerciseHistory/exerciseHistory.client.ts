import { boundClass } from 'autobind-decorator';

import { api } from '../api/api.service';
import { ApiClient } from '../api/ApiClient';
import type { ExerciseHistoryResponse } from './exerciseHistory.models.ts';

@boundClass
class ExerciseHistoryClient extends ApiClient {
  private static _instance: ExerciseHistoryClient;

  static get instance(): ExerciseHistoryClient {
    return this._instance ?? (this._instance = new this());
  }

  private getExerciseHistoryUrl(clientId: string, exerciseId: string): string {
    return `${this.getApiUrl()}/clients/${encodeURIComponent(clientId)}/exercise-history/${encodeURIComponent(exerciseId)}`;
  }

  async get(clientId: string, exerciseId: string): Promise<ExerciseHistoryResponse> {
    return await api.get<ExerciseHistoryResponse>(this.getExerciseHistoryUrl(clientId, exerciseId), {
      cache: { disabled: true }
    });
  }
}

export const exerciseHistoryClient = ExerciseHistoryClient.instance;
