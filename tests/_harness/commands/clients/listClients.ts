import { clientsClient } from '../../../../src/services/clients/clients.client';
import type { Client } from '../../../../src/services/clients/clients.models';
import { requestAsAdmin, requestWithoutAuth } from '../requestAs';

export async function listClientsAsAdmin(): Promise<readonly Client[]> {
  const response = await requestAsAdmin(clientsClient.list);

  return response.clients;
}

export async function listClientsWithoutAuth(): Promise<readonly Client[]> {
  const response = await requestWithoutAuth(clientsClient.list);

  return response.clients;
}
