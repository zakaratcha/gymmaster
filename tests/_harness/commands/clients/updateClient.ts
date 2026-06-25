import { clientsClient } from '../../../../src/services/clients/clients.client';
import type { Client, UpdateClientRequest } from '../../../../src/services/clients/clients.models';
import type { TestUsername } from '../auth/testUsers';
import { requestAs, requestAsAdmin, requestWithoutAuth } from '../requestAs';

export async function updateClient(id: string, payload: UpdateClientRequest): Promise<Client> {
  const response = await requestAsAdmin(clientsClient.update, id, payload);

  return response.client;
}

export async function updateClientWithoutAuth(id: string, payload: UpdateClientRequest): Promise<Client> {
  const response = await requestWithoutAuth(clientsClient.update, id, payload);

  return response.client;
}

export async function updateClientForUser(
  user: TestUsername,
  id: string,
  payload: UpdateClientRequest
): Promise<Client> {
  const response = await requestAs(user, clientsClient.update, id, payload);

  return response.client;
}

export async function updateClientForTrainer(id: string, payload: UpdateClientRequest): Promise<Client> {
  return await updateClientForUser('Тренер', id, payload);
}
