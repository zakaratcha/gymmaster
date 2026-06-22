import { randomUUID } from 'node:crypto';
import { and, asc, eq } from 'drizzle-orm';

import type { ClientResponse, ClientsListResponse } from '../../services/clients/clients.models.ts';
import type { AuthContext } from '../auth/authContext.ts';
import { getDb } from '../db/client.ts';
import { clients } from '../db/schema.ts';
import { toPublicClient, type ValidatedCreateClientInput, type ValidatedUpdateClientInput } from './clientMapper.ts';

export async function listClients(auth: AuthContext): Promise<ClientsListResponse> {
  const db = getDb();
  const rows = await db.select().from(clients).where(eq(clients.trainerId, auth.trainerId)).orderBy(asc(clients.name));

  return {
    clients: rows.map(toPublicClient)
  };
}

export async function createClient(auth: AuthContext, input: ValidatedCreateClientInput): Promise<ClientResponse> {
  const db = getDb();
  const now = new Date().toISOString();
  const id = randomUUID();

  // eslint-disable-next-line unicorn/no-unused-array-method-return -- Drizzle insert builder, not Map.values()
  await db.insert(clients).values({
    id,
    trainerId: auth.trainerId,
    name: input.name,
    notes: input.notes ?? null,
    bodyWeightKg: input.bodyWeightKg ?? null,
    createdAt: now,
    updatedAt: now
  });

  const rows = await db
    .select()
    .from(clients)
    .where(and(eq(clients.id, id), eq(clients.trainerId, auth.trainerId)))
    .limit(1);

  const row = rows[0];
  if (row === undefined) {
    throw new Error('Failed to create client');
  }

  return { client: toPublicClient(row) };
}

export async function getClientById(auth: AuthContext, id: string): Promise<ClientResponse | undefined> {
  const db = getDb();
  const rows = await db
    .select()
    .from(clients)
    .where(and(eq(clients.id, id), eq(clients.trainerId, auth.trainerId)))
    .limit(1);

  const row = rows[0];
  if (row === undefined) {
    return undefined;
  }

  return { client: toPublicClient(row) };
}

export async function updateClient(
  auth: AuthContext,
  id: string,
  input: ValidatedUpdateClientInput
): Promise<ClientResponse | undefined> {
  const db = getDb();
  const existing = await getClientById(auth, id);
  if (existing === undefined) {
    return undefined;
  }

  const now = new Date().toISOString();
  const patch: {
    name?: string;
    notes?: string | null;
    bodyWeightKg?: number | null;
    updatedAt: string;
  } = { updatedAt: now };

  if (input.name !== undefined) {
    patch.name = input.name;
  }

  if (input.notes !== undefined) {
    patch.notes = input.notes;
  }

  if (input.bodyWeightKg !== undefined) {
    patch.bodyWeightKg = input.bodyWeightKg;
  }

  await db
    .update(clients)
    .set(patch)
    .where(and(eq(clients.id, id), eq(clients.trainerId, auth.trainerId)));

  return await getClientById(auth, id);
}

export async function deleteClient(auth: AuthContext, id: string): Promise<boolean> {
  const db = getDb();
  const result = await db.delete(clients).where(and(eq(clients.id, id), eq(clients.trainerId, auth.trainerId)));

  return result.changes > 0;
}
