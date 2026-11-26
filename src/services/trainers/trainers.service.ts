import { adminTrainersClient } from './trainers.client';
import type { AdminTrainer, CreateTrainerRequest, TrainerStatus } from './trainers.models';

export async function listAdminTrainers(): Promise<readonly AdminTrainer[]> {
  const response = await adminTrainersClient.list();
  return response.trainers;
}

export async function createTrainer(payload: CreateTrainerRequest): Promise<AdminTrainer> {
  const response = await adminTrainersClient.create(payload);
  return response.trainer;
}

export async function setTrainerStatus(id: string, status: TrainerStatus): Promise<AdminTrainer> {
  const response = await adminTrainersClient.setStatus(id, { status });
  return response.trainer;
}

export async function resetTrainerPassword(id: string, password: string): Promise<void> {
  await adminTrainersClient.resetPassword(id, { password });
}
