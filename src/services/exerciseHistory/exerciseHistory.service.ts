import { exerciseHistoryClient } from './exerciseHistory.client';
import type { ExerciseHistoryResponse } from './exerciseHistory.models.ts';

export async function getExerciseHistory(clientId: string, exerciseId: string): Promise<ExerciseHistoryResponse> {
  return await exerciseHistoryClient.get(clientId, exerciseId);
}
