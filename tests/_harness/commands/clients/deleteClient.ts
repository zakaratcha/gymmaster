import { clientsClient } from '../../../../src/services/clients/clients.client';
import { requestAsAdmin } from '../requestAs';

export async function deleteClient(id: string): Promise<void> {
  await requestAsAdmin(clientsClient.delete, id);
}
