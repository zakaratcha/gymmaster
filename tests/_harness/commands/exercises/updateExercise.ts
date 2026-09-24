import { exercisesClient } from '../../../../src/services/exercises/exercises.client';
import type {
  Exercise,
  ExerciseResponse,
  UpdateExerciseRequest
} from '../../../../src/services/exercises/exercises.models';
import { requestAsAdmin, requestAsTrainer, requestWithoutAuth } from '../requestAs';

export async function updateExercise(id: string, payload: UpdateExerciseRequest): Promise<Exercise> {
  const response = await requestAsAdmin<ExerciseResponse, [string, UpdateExerciseRequest]>(
    exercisesClient.update,
    id,
    payload
  );
  return response.exercise;
}

export async function updateExerciseForTrainer(id: string, payload: UpdateExerciseRequest): Promise<Exercise> {
  const response = await requestAsTrainer<ExerciseResponse, [string, UpdateExerciseRequest]>(
    exercisesClient.update,
    id,
    payload
  );
  return response.exercise;
}

export async function updateExerciseWithoutAuth(id: string, payload: UpdateExerciseRequest): Promise<Exercise> {
  const response = await requestWithoutAuth<ExerciseResponse, [string, UpdateExerciseRequest]>(
    exercisesClient.update,
    id,
    payload
  );
  return response.exercise;
}
