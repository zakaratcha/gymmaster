import { workoutSessionsClient } from '../../../../src/services/workoutSessions/workoutSessions.client';
import type {
  CreateWorkoutSessionRequest,
  UpdateWorkoutSessionRequest,
  WorkoutSessionActiveResponse,
  WorkoutSessionLatestCompletedResponse,
  WorkoutSessionResponse
} from '../../../../src/services/workoutSessions/workoutSessions.models';
import { requestAsAdmin, requestAsTrainer, requestWithoutAuth } from '../requestAs';

export async function createWorkoutSession(
  clientId: string,
  payload: CreateWorkoutSessionRequest
): Promise<WorkoutSessionResponse> {
  return await requestAsAdmin<WorkoutSessionResponse, [string, CreateWorkoutSessionRequest]>(
    workoutSessionsClient.create,
    clientId,
    payload
  );
}

export async function createWorkoutSessionForTrainer(
  clientId: string,
  payload: CreateWorkoutSessionRequest
): Promise<WorkoutSessionResponse> {
  return await requestAsTrainer<WorkoutSessionResponse, [string, CreateWorkoutSessionRequest]>(
    workoutSessionsClient.create,
    clientId,
    payload
  );
}

export async function createWorkoutSessionWithoutAuth(
  clientId: string,
  payload: CreateWorkoutSessionRequest
): Promise<WorkoutSessionResponse> {
  return await requestWithoutAuth<WorkoutSessionResponse, [string, CreateWorkoutSessionRequest]>(
    workoutSessionsClient.create,
    clientId,
    payload
  );
}

export async function getActiveWorkoutSession(clientId: string): Promise<WorkoutSessionActiveResponse> {
  return await requestAsAdmin<WorkoutSessionActiveResponse, [string]>(workoutSessionsClient.getActive, clientId);
}

export async function getActiveWorkoutSessionForTrainer(clientId: string): Promise<WorkoutSessionActiveResponse> {
  return await requestAsTrainer<WorkoutSessionActiveResponse, [string]>(workoutSessionsClient.getActive, clientId);
}

export async function getActiveWorkoutSessionWithoutAuth(clientId: string): Promise<WorkoutSessionActiveResponse> {
  return await requestWithoutAuth<WorkoutSessionActiveResponse, [string]>(workoutSessionsClient.getActive, clientId);
}

export async function getLatestCompletedWorkoutSession(
  clientId: string
): Promise<WorkoutSessionLatestCompletedResponse> {
  return await requestAsAdmin<WorkoutSessionLatestCompletedResponse, [string]>(
    workoutSessionsClient.getLatestCompleted,
    clientId
  );
}

export async function getLatestCompletedWorkoutSessionForTrainer(
  clientId: string
): Promise<WorkoutSessionLatestCompletedResponse> {
  return await requestAsTrainer<WorkoutSessionLatestCompletedResponse, [string]>(
    workoutSessionsClient.getLatestCompleted,
    clientId
  );
}

export async function getLatestCompletedWorkoutSessionWithoutAuth(
  clientId: string
): Promise<WorkoutSessionLatestCompletedResponse> {
  return await requestWithoutAuth<WorkoutSessionLatestCompletedResponse, [string]>(
    workoutSessionsClient.getLatestCompleted,
    clientId
  );
}

export async function getWorkoutSession(clientId: string, sessionId: string): Promise<WorkoutSessionResponse> {
  return await requestAsAdmin<WorkoutSessionResponse, [string, string]>(
    workoutSessionsClient.getById,
    clientId,
    sessionId
  );
}

export async function getWorkoutSessionForTrainer(
  clientId: string,
  sessionId: string
): Promise<WorkoutSessionResponse> {
  return await requestAsTrainer<WorkoutSessionResponse, [string, string]>(
    workoutSessionsClient.getById,
    clientId,
    sessionId
  );
}

export async function getWorkoutSessionWithoutAuth(
  clientId: string,
  sessionId: string
): Promise<WorkoutSessionResponse> {
  return await requestWithoutAuth<WorkoutSessionResponse, [string, string]>(
    workoutSessionsClient.getById,
    clientId,
    sessionId
  );
}

export async function updateWorkoutSession(
  clientId: string,
  sessionId: string,
  payload: UpdateWorkoutSessionRequest
): Promise<WorkoutSessionResponse> {
  return await requestAsAdmin<WorkoutSessionResponse, [string, string, UpdateWorkoutSessionRequest]>(
    workoutSessionsClient.update,
    clientId,
    sessionId,
    payload
  );
}

export async function updateWorkoutSessionForTrainer(
  clientId: string,
  sessionId: string,
  payload: UpdateWorkoutSessionRequest
): Promise<WorkoutSessionResponse> {
  return await requestAsTrainer<WorkoutSessionResponse, [string, string, UpdateWorkoutSessionRequest]>(
    workoutSessionsClient.update,
    clientId,
    sessionId,
    payload
  );
}

export async function updateWorkoutSessionWithoutAuth(
  clientId: string,
  sessionId: string,
  payload: UpdateWorkoutSessionRequest
): Promise<WorkoutSessionResponse> {
  return await requestWithoutAuth<WorkoutSessionResponse, [string, string, UpdateWorkoutSessionRequest]>(
    workoutSessionsClient.update,
    clientId,
    sessionId,
    payload
  );
}

export async function completeWorkoutSession(clientId: string, sessionId: string): Promise<WorkoutSessionResponse> {
  return await requestAsAdmin<WorkoutSessionResponse, [string, string]>(
    workoutSessionsClient.complete,
    clientId,
    sessionId
  );
}

export async function completeWorkoutSessionForTrainer(
  clientId: string,
  sessionId: string
): Promise<WorkoutSessionResponse> {
  return await requestAsTrainer<WorkoutSessionResponse, [string, string]>(
    workoutSessionsClient.complete,
    clientId,
    sessionId
  );
}

export async function completeWorkoutSessionWithoutAuth(
  clientId: string,
  sessionId: string
): Promise<WorkoutSessionResponse> {
  return await requestWithoutAuth<WorkoutSessionResponse, [string, string]>(
    workoutSessionsClient.complete,
    clientId,
    sessionId
  );
}
