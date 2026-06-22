import { clientsClient } from '../../../../src/services/clients/clients.client';
import { getTestUser } from '../auth/testUsers';
import { requestAs, requestAsAdmin, requestWithoutAuth } from '../requestAs';

export async function deleteClient(id: string): Promise<void> {
  await requestAsAdmin(clientsClient.delete, id);
}

export async function deleteClientWithoutAuth(id: string): Promise<void> {
  await requestWithoutAuth(clientsClient.delete, id);
}

export async function deleteClientForTrainer(id: string): Promise<void> {
  await requestAs(getTestUser('Тренер'), clientsClient.delete, id);
}
