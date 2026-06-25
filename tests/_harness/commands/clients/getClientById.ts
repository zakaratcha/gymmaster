import { clientsClient } from '../../../../src/services/clients/clients.client';
import type { Client } from '../../../../src/services/clients/clients.models';
import { requestAs, requestAsAdmin, requestWithoutAuth } from '../requestAs';

export async function getClientByIdAsAdmin(id: string): Promise<Client> {
  const response = await requestAsAdmin(clientsClient.getById, id);

  return response.client;
}

export async function getClientByIdWithoutAuth(id: string): Promise<Client> {
  const response = await requestWithoutAuth(clientsClient.getById, id);

  return response.client;
}

export async function getClientByIdForTrainer(id: string): Promise<Client> {
  const response = await requestAs('Тренер', clientsClient.getById, id);

  return response.client;
}
