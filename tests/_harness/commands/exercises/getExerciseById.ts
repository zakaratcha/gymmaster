import { exercisesClient } from '../../../../src/services/exercises/exercises.client';
import type { Exercise, ExerciseResponse } from '../../../../src/services/exercises/exercises.models';
import { requestAsAdmin, requestAsTrainer, requestWithoutAuth } from '../requestAs';

export async function getExerciseByIdAsAdmin(id: string): Promise<Exercise> {
  const response = await requestAsAdmin<ExerciseResponse, [string]>(exercisesClient.getById, id);
  return response.exercise;
}

export async function getExerciseByIdForTrainer(id: string): Promise<Exercise> {
  const response = await requestAsTrainer<ExerciseResponse, [string]>(exercisesClient.getById, id);
  return response.exercise;
}

export async function getExerciseByIdWithoutAuth(id: string): Promise<Exercise> {
  const response = await requestWithoutAuth<ExerciseResponse, [string]>(exercisesClient.getById, id);
  return response.exercise;
}
