import { clientsClient } from '../../../../src/services/clients/clients.client';
import { requestAsAdmin } from '../requestAs';

export async function deleteAllClients(): Promise<void> {
  const response = await requestAsAdmin(clientsClient.list);

  for (const client of response.clients) {
    await requestAsAdmin(clientsClient.delete, client.id);
  }
}
