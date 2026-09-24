import { exercisesClient } from '../../../../src/services/exercises/exercises.client';
import type {
  CreateExerciseRequest,
  Exercise,
  ExerciseResponse
} from '../../../../src/services/exercises/exercises.models';
import { requestAsAdmin, requestWithoutAuth } from '../requestAs';

export async function createExercise(payload: CreateExerciseRequest): Promise<Exercise> {
  const response = await requestAsAdmin<ExerciseResponse, [CreateExerciseRequest]>(exercisesClient.create, payload);
  return response.exercise;
}

export async function createExerciseWithoutAuth(payload: CreateExerciseRequest): Promise<Exercise> {
  const response = await requestWithoutAuth<ExerciseResponse, [CreateExerciseRequest]>(exercisesClient.create, payload);
  return response.exercise;
}
