import { clientsClient } from '../../../../src/services/clients/clients.client';
import type { Client } from '../../../../src/services/clients/clients.models';
import { requestAsAdmin, requestWithoutAuth } from '../requestAs';

export async function getClientByIdAsAdmin(id: string): Promise<Client> {
  const response = await requestAsAdmin(clientsClient.getById, id);

  return response.client;
}

export async function getClientByIdWithoutAuth(id: string): Promise<Client> {
  const response = await requestWithoutAuth(clientsClient.getById, id);

  return response.client;
}
