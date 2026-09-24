import { plansClient } from '../../../../src/services/plans/plans.client';
import type {
  CreatePlannedWorkoutRequest,
  PlannedWorkout,
  PlanResponse,
  PlansListResponse,
  UpdatePlannedWorkoutRequest
} from '../../../../src/services/plans/plans.models';
import { requestAsAdmin, requestAsTrainer, requestWithoutAuth } from '../requestAs';

export async function createPlan(clientId: string, payload: CreatePlannedWorkoutRequest): Promise<PlannedWorkout> {
  const response = await requestAsAdmin<PlanResponse, [string, CreatePlannedWorkoutRequest]>(
    plansClient.create,
    clientId,
    payload
  );
  return response.plan;
}

export async function createPlanForTrainer(
  clientId: string,
  payload: CreatePlannedWorkoutRequest
): Promise<PlannedWorkout> {
  const response = await requestAsTrainer<PlanResponse, [string, CreatePlannedWorkoutRequest]>(
    plansClient.create,
    clientId,
    payload
  );
  return response.plan;
}

export async function createPlanWithoutAuth(
  clientId: string,
  payload: CreatePlannedWorkoutRequest
): Promise<PlannedWorkout> {
  const response = await requestWithoutAuth<PlanResponse, [string, CreatePlannedWorkoutRequest]>(
    plansClient.create,
    clientId,
    payload
  );
  return response.plan;
}

export async function listPlans(clientId: string): Promise<readonly PlannedWorkout[]> {
  const response = await requestAsAdmin<PlansListResponse, [string]>(plansClient.list, clientId);
  return response.plans;
}

export async function listPlansForTrainer(clientId: string): Promise<readonly PlannedWorkout[]> {
  const response = await requestAsTrainer<PlansListResponse, [string]>(plansClient.list, clientId);
  return response.plans;
}

export async function listPlansWithoutAuth(clientId: string): Promise<readonly PlannedWorkout[]> {
  const response = await requestWithoutAuth<PlansListResponse, [string]>(plansClient.list, clientId);
  return response.plans;
}

export async function getPlan(clientId: string, planId: string): Promise<PlannedWorkout> {
  const response = await requestAsAdmin<PlanResponse, [string, string]>(plansClient.getById, clientId, planId);
  return response.plan;
}

export async function getPlanForTrainer(clientId: string, planId: string): Promise<PlannedWorkout> {
  const response = await requestAsTrainer<PlanResponse, [string, string]>(plansClient.getById, clientId, planId);
  return response.plan;
}

export async function getPlanWithoutAuth(clientId: string, planId: string): Promise<PlannedWorkout> {
  const response = await requestWithoutAuth<PlanResponse, [string, string]>(plansClient.getById, clientId, planId);
  return response.plan;
}

export async function updatePlan(
  clientId: string,
  planId: string,
  payload: UpdatePlannedWorkoutRequest
): Promise<PlannedWorkout> {
  const response = await requestAsAdmin<PlanResponse, [string, string, UpdatePlannedWorkoutRequest]>(
    plansClient.update,
    clientId,
    planId,
    payload
  );
  return response.plan;
}

export async function updatePlanForTrainer(
  clientId: string,
  planId: string,
  payload: UpdatePlannedWorkoutRequest
): Promise<PlannedWorkout> {
  const response = await requestAsTrainer<PlanResponse, [string, string, UpdatePlannedWorkoutRequest]>(
    plansClient.update,
    clientId,
    planId,
    payload
  );
  return response.plan;
}

export async function updatePlanWithoutAuth(
  clientId: string,
  planId: string,
  payload: UpdatePlannedWorkoutRequest
): Promise<PlannedWorkout> {
  const response = await requestWithoutAuth<PlanResponse, [string, string, UpdatePlannedWorkoutRequest]>(
    plansClient.update,
    clientId,
    planId,
    payload
  );
  return response.plan;
}

export async function deletePlan(clientId: string, planId: string): Promise<void> {
  await requestAsAdmin(plansClient.delete, clientId, planId);
}

export async function deletePlanForTrainer(clientId: string, planId: string): Promise<void> {
  await requestAsTrainer(plansClient.delete, clientId, planId);
}

export async function deletePlanWithoutAuth(clientId: string, planId: string): Promise<void> {
  await requestWithoutAuth(plansClient.delete, clientId, planId);
}
