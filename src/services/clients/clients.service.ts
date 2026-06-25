import { isArray } from '../util/typeGuards/isArray';
import { clientsClient } from './clients.client';
import type { Client, CreateClientRequest, UpdateClientRequest } from './clients.models';

const MAX_RECENT_CLIENT_IDS = 3;
const RECENT_CLIENTS_STORAGE_KEY = 'gymmaster:recentClientIds';

function readRecentClientIdsFromStorage(): readonly string[] {
  if (typeof localStorage === 'undefined') {
    return [];
  }

  try {
    const raw = localStorage.getItem(RECENT_CLIENTS_STORAGE_KEY);
    if (raw === null) {
      return [];
    }

    const parsed: unknown = JSON.parse(raw);
    if (!isArray(parsed)) {
      return [];
    }

    return parsed.filter((id): id is string => typeof id === 'string');
  } catch {
    return [];
  }
}

function writeRecentClientIdsToStorage(ids: readonly string[]): void {
  if (typeof localStorage === 'undefined') {
    return;
  }

  localStorage.setItem(RECENT_CLIENTS_STORAGE_KEY, JSON.stringify(ids));
}

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

export function getRecentClientIds(): readonly string[] {
  return readRecentClientIdsFromStorage();
}

export function resolveRecentClientIds(clients: readonly Client[]): readonly string[] {
  const validIds = new Set(clients.map(client => client.id));
  return getRecentClientIds().filter(id => validIds.has(id));
}

export function pushRecentClientId(id: string): void {
  const withoutDuplicate = getRecentClientIds().filter(existingId => existingId !== id);
  const updated = [id, ...withoutDuplicate].slice(0, MAX_RECENT_CLIENT_IDS);
  writeRecentClientIdsToStorage(updated);
}
