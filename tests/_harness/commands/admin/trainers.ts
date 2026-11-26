import { randomUUID } from 'node:crypto';

import { authClient } from '../../../../src/services/auth/auth.client';
import { clientsClient } from '../../../../src/services/clients/clients.client';
import type { Client } from '../../../../src/services/clients/clients.models';
import { exercisesClient } from '../../../../src/services/exercises/exercises.client';
import type { Exercise } from '../../../../src/services/exercises/exercises.models';
import { adminTrainersClient } from '../../../../src/services/trainers/trainers.client';
import type {
  AdminTrainer,
  AdminTrainersResponse,
  CreateTrainerRequest,
  Trainer,
  TrainerStatus
} from '../../../../src/services/trainers/trainers.models';
import { getEmailCookies, loginWithCredentials } from '../auth/apiSession';
import { createClientForTrainer } from '../clients/createClient';
import { requestAsAdmin, requestAsTrainer, requestWithEmailSession, requestWithoutAuth } from '../requestAs';
import {
  createScenarioTrainerEmail,
  rememberForeignClient,
  rememberScenarioTrainer,
  rememberSecondScenarioTrainer,
  requireScenarioTrainer
} from './scenarioTrainer';

const MISSING_TRAINER_ID = '00000000-0000-0000-0000-000000000000';

type CreateTrainerExtra = {
  readonly roles?: readonly string[];
  readonly admin?: number;
};

function buildCreateBody(email: string, password: string, extra?: CreateTrainerExtra): CreateTrainerRequest {
  return { email, password, ...extra };
}

export async function listTrainersAsAdmin(): Promise<AdminTrainersResponse> {
  return await requestAsAdmin(adminTrainersClient.list);
}

export async function listTrainersAsTrainer(): Promise<AdminTrainersResponse> {
  return await requestAsTrainer(adminTrainersClient.list);
}

export async function listTrainersWithoutAuth(): Promise<AdminTrainersResponse> {
  return await requestWithoutAuth(adminTrainersClient.list);
}

export async function createTrainerAsAdmin(
  email: string,
  password: string,
  extra?: CreateTrainerExtra
): Promise<AdminTrainer> {
  const response = await requestAsAdmin(adminTrainersClient.create, buildCreateBody(email, password, extra));
  return response.trainer;
}

export async function createScenarioTrainerAsRoleless(password: string): Promise<AdminTrainer> {
  const email = createScenarioTrainerEmail();
  rememberScenarioTrainer({ email, password });
  const response = await requestAsTrainer(adminTrainersClient.create, { email, password });
  rememberScenarioTrainer({ id: response.trainer.id, email: response.trainer.email, password });
  return response.trainer;
}

export async function listTrainersAsStoredScenarioTrainer(): Promise<AdminTrainersResponse> {
  const { email } = requireScenarioTrainer();
  return await requestWithEmailSession(email, adminTrainersClient.list);
}

export async function createScenarioTrainerAsAdmin(
  password: string,
  extra?: CreateTrainerExtra
): Promise<AdminTrainer> {
  const email = createScenarioTrainerEmail();
  rememberScenarioTrainer({ email, password });
  const trainer = await createTrainerAsAdmin(email, password, extra);
  rememberScenarioTrainer({ id: trainer.id, email: trainer.email, password });
  return trainer;
}

export async function createSecondScenarioTrainerAsAdmin(password: string): Promise<AdminTrainer> {
  const email = createScenarioTrainerEmail();
  rememberSecondScenarioTrainer({ email, password });
  const trainer = await createTrainerAsAdmin(email, password);
  rememberSecondScenarioTrainer({ id: trainer.id, email: trainer.email, password });
  return trainer;
}

export async function setScenarioTrainerStatus(status: TrainerStatus): Promise<AdminTrainer> {
  const trainer = requireScenarioTrainer();
  if (trainer.id === undefined) {
    throw new Error('У учётки сценария нет id');
  }

  const response = await requestAsAdmin(adminTrainersClient.setStatus, trainer.id, { status });
  return response.trainer;
}

export async function resetScenarioTrainerPassword(password: string): Promise<void> {
  const trainer = requireScenarioTrainer();
  if (trainer.id === undefined) {
    throw new Error('У учётки сценария нет id');
  }

  await requestAsAdmin(adminTrainersClient.resetPassword, trainer.id, { password });
}

export async function setMissingTrainerStatus(status: TrainerStatus): Promise<AdminTrainer> {
  const response = await requestAsAdmin(adminTrainersClient.setStatus, MISSING_TRAINER_ID, { status });
  return response.trainer;
}

async function ensureScenarioTrainerSession(): Promise<string> {
  const { email, password } = requireScenarioTrainer();
  if (getEmailCookies(email) === undefined) {
    const result = await loginWithCredentials(email, password);
    if (!result.ok) {
      throw new Error(result.error);
    }
  }

  return email;
}

export async function listScenarioTrainerExercises(): Promise<readonly Exercise[]> {
  const email = await ensureScenarioTrainerSession();
  const response = await requestWithEmailSession(email, exercisesClient.list);
  return response.exercises;
}

export async function listScenarioTrainerClients(): Promise<readonly Client[]> {
  const email = await ensureScenarioTrainerSession();
  const response = await requestWithEmailSession(email, clientsClient.list);
  return response.clients;
}

export async function blockOwnTrainerAccount(): Promise<void> {
  const current = await requestAsAdmin(authClient.getCurrentUser);
  await requestAsAdmin(adminTrainersClient.setStatus, current.trainer.id, { status: 'blocked' });
}

export async function readCurrentAdmin(): Promise<Trainer> {
  const response = await requestAsAdmin(authClient.getCurrentUser);
  return response.trainer;
}

export async function createForeignClient(): Promise<Client> {
  const name = `Чужой клиент ${randomUUID()}`;
  const client = await createClientForTrainer({ name });
  rememberForeignClient({ id: client.id, name: client.name });
  return client;
}
