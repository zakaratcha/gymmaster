import { clientsClient } from '../../../../src/services/clients/clients.client';
import type { Client, UpdateClientRequest } from '../../../../src/services/clients/clients.models';
import { requestAsAdmin } from '../requestAs';

export async function updateClient(id: string, payload: UpdateClientRequest): Promise<Client> {
  const response = await requestAsAdmin(clientsClient.update, id, payload);

  return response.client;
}
