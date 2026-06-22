import { clientsClient } from './clients.client';
import type { Client, CreateClientRequest, UpdateClientRequest } from './clients.models';

export async function listClients(): Promise<readonly Client[]> {
  const response = await clientsClient.list();
  return response.clients;
}

export async function createClient(payload: CreateClientRequest): Promise<Client> {
  const response = await clientsClient.create(payload);
  return response.client;
}

export async function getClientById(id: string): Promise<Client> {
  const response = await clientsClient.getById(id);
  return response.client;
}

export async function updateClient(id: string, payload: UpdateClientRequest): Promise<Client> {
  const response = await clientsClient.update(id, payload);
  return response.client;
}

export async function deleteClient(id: string): Promise<void> {
  await clientsClient.delete(id);
}
