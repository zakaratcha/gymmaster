import { exercisesClient } from '../../../../src/services/exercises/exercises.client';
import type { ExercisesListResponse } from '../../../../src/services/exercises/exercises.models';
import { requestAsAdmin, requestAsTrainer, requestWithoutAuth } from '../requestAs';

export async function listExercisesAsAdmin(includeArchived = false): Promise<ExercisesListResponse> {
  return await requestAsAdmin(exercisesClient.list, includeArchived);
}

export async function listExercisesAsTrainer(includeArchived = false): Promise<ExercisesListResponse> {
  return await requestAsTrainer(exercisesClient.list, includeArchived);
}

export async function listExercisesWithoutAuth(): Promise<ExercisesListResponse> {
  return await requestWithoutAuth(exercisesClient.list);
}
