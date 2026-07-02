import type { Client } from '../../../../src/services/clients/clients.models';
import { listClientsAsAdmin } from './listClients';

export async function findClientByName(name: string): Promise<Client> {
  const clients = await listClientsAsAdmin();
  const client = clients.find(item => item.name === name);

  if (client === undefined) {
    throw new Error(`Клиент "${name}" не найден`);
  }

  return client;
}
