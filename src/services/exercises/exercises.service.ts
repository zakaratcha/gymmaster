import { exercisesClient } from './exercises.client';
import type { CreateExerciseRequest, Exercise, UpdateExerciseRequest } from './exercises.models.ts';

export async function listExercises(includeArchived = false): Promise<readonly Exercise[]> {
  const response = await exercisesClient.list(includeArchived);
  return response.exercises;
}

export async function createExercise(payload: CreateExerciseRequest): Promise<Exercise> {
  const response = await exercisesClient.create(payload);
  return response.exercise;
}

export async function getExerciseById(id: string): Promise<Exercise> {
  const response = await exercisesClient.getById(id);
  return response.exercise;
}

export async function updateExercise(id: string, payload: UpdateExerciseRequest): Promise<Exercise> {
  const response = await exercisesClient.update(id, payload);
  return response.exercise;
}
