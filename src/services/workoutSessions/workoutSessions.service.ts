import { workoutSessionsClient } from './workoutSessions.client';
import type {
  CreateWorkoutSessionRequest,
  UpdateWorkoutSessionRequest,
  WorkoutSession
} from './workoutSessions.models';

export async function createWorkoutSession(
  clientId: string,
  payload: CreateWorkoutSessionRequest
): Promise<WorkoutSession> {
  const response = await workoutSessionsClient.create(clientId, payload);
  return response.workoutSession;
}

export async function getActiveWorkoutSession(clientId: string): Promise<WorkoutSession | null> {
  const response = await workoutSessionsClient.getActive(clientId);
  return response.workoutSession;
}

export async function getLatestCompletedWorkoutSession(clientId: string): Promise<WorkoutSession | null> {
  const response = await workoutSessionsClient.getLatestCompleted(clientId);
  return response.workoutSession;
}

export async function getWorkoutSession(clientId: string, sessionId: string): Promise<WorkoutSession> {
  const response = await workoutSessionsClient.getById(clientId, sessionId);
  return response.workoutSession;
}

export async function updateWorkoutSession(
  clientId: string,
  sessionId: string,
  payload: UpdateWorkoutSessionRequest
): Promise<WorkoutSession> {
  const response = await workoutSessionsClient.update(clientId, sessionId, payload);
  return response.workoutSession;
}

export async function completeWorkoutSession(clientId: string, sessionId: string): Promise<WorkoutSession> {
  const response = await workoutSessionsClient.complete(clientId, sessionId);
  return response.workoutSession;
}
