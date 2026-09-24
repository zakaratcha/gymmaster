import { boundClass } from 'autobind-decorator';

import { api } from '../api/api.service';
import { ApiClient } from '../api/ApiClient';
import type {
  CreateExerciseRequest,
  ExerciseResponse,
  ExercisesListResponse,
  UpdateExerciseRequest
} from './exercises.models.ts';

@boundClass
class ExercisesClient extends ApiClient {
  private static _instance: ExercisesClient;

  static get instance(): ExercisesClient {
    return this._instance ?? (this._instance = new this());
  }

  private getExercisesUrl(): string {
    return `${this.getApiUrl()}/exercises`;
  }

  private getExerciseUrl(id: string): string {
    return `${this.getExercisesUrl()}/${id}`;
  }

  async list(includeArchived = false): Promise<ExercisesListResponse> {
    return await api.get<ExercisesListResponse>(this.getExercisesUrl(), {
      cache: { disabled: true },
      params: includeArchived ? { includeArchived: 'true' } : undefined
    });
  }

  async create(payload: CreateExerciseRequest): Promise<ExerciseResponse> {
    return await api.post<ExerciseResponse>(this.getExercisesUrl(), payload);
  }

  async getById(id: string): Promise<ExerciseResponse> {
    return await api.get<ExerciseResponse>(this.getExerciseUrl(id), { cache: { disabled: true } });
  }

  async update(id: string, payload: UpdateExerciseRequest): Promise<ExerciseResponse> {
    return await api.patch<ExerciseResponse>(this.getExerciseUrl(id), payload);
  }
}

export const exercisesClient = ExercisesClient.instance;
