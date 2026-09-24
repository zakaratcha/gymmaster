import { plansClient } from './plans.client';
import type { CreatePlannedWorkoutRequest, PlannedWorkout, UpdatePlannedWorkoutRequest } from './plans.models';

export async function listPlans(clientId: string): Promise<readonly PlannedWorkout[]> {
  const response = await plansClient.list(clientId);
  return response.plans;
}

export async function getPlanById(clientId: string, planId: string): Promise<PlannedWorkout> {
  const response = await plansClient.getById(clientId, planId);
  return response.plan;
}

export async function createPlan(clientId: string, payload: CreatePlannedWorkoutRequest): Promise<PlannedWorkout> {
  const response = await plansClient.create(clientId, payload);
  return response.plan;
}

export async function updatePlan(
  clientId: string,
  planId: string,
  payload: UpdatePlannedWorkoutRequest
): Promise<PlannedWorkout> {
  const response = await plansClient.update(clientId, planId, payload);
  return response.plan;
}

export async function deletePlan(clientId: string, planId: string): Promise<void> {
  await plansClient.delete(clientId, planId);
}
