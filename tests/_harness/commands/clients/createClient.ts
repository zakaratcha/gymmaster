import { clientsClient } from '../../../../src/services/clients/clients.client';
import type { Client, CreateClientRequest } from '../../../../src/services/clients/clients.models';
import { requestAsAdmin } from '../requestAs';

export async function createClient(payload: CreateClientRequest): Promise<Client> {
  const response = await requestAsAdmin(clientsClient.create, payload);

  return response.client;
}
