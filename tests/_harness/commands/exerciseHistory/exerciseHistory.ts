import { exerciseHistoryClient } from '../../../../src/services/exerciseHistory/exerciseHistory.client';
import type { ExerciseHistoryResponse } from '../../../../src/services/exerciseHistory/exerciseHistory.models';
import { requestAsAdmin, requestAsTrainer, requestWithoutAuth } from '../requestAs';

export async function getExerciseHistory(clientId: string, exerciseId: string): Promise<ExerciseHistoryResponse> {
  return await requestAsAdmin(exerciseHistoryClient.get, clientId, exerciseId);
}

export async function getExerciseHistoryForTrainer(
  clientId: string,
  exerciseId: string
): Promise<ExerciseHistoryResponse> {
  return await requestAsTrainer(exerciseHistoryClient.get, clientId, exerciseId);
}

export async function getExerciseHistoryWithoutAuth(
  clientId: string,
  exerciseId: string
): Promise<ExerciseHistoryResponse> {
  return await requestWithoutAuth(exerciseHistoryClient.get, clientId, exerciseId);
}
