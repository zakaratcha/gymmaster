import { exercisesClient } from '../../../../src/services/exercises/exercises.client';
import type {
  CreateExerciseRequest,
  Exercise,
  ExerciseResponse
} from '../../../../src/services/exercises/exercises.models';
import { requestAsAdmin, requestAsTrainer, requestWithoutAuth } from '../requestAs';

export async function createExercise(payload: CreateExerciseRequest): Promise<Exercise> {
  const response = await requestAsAdmin<ExerciseResponse, [CreateExerciseRequest]>(exercisesClient.create, payload);
  return response.exercise;
}

export async function createExerciseWithoutAuth(payload: CreateExerciseRequest): Promise<Exercise> {
  const response = await requestWithoutAuth<ExerciseResponse, [CreateExerciseRequest]>(exercisesClient.create, payload);
  return response.exercise;
}

export async function createExerciseForTrainer(payload: CreateExerciseRequest): Promise<Exercise> {
  const response = await requestAsTrainer<ExerciseResponse, [CreateExerciseRequest]>(exercisesClient.create, payload);
  return response.exercise;
}
