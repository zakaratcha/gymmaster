import { randomUUID } from 'node:crypto';
import { and, asc, eq, sql } from 'drizzle-orm';

import type { SplitTagsResponse } from '../../services/splitTags/splitTags.models.ts';
import { toSplitTagKey } from '../../services/splitTags/splitTags.utils.ts';
import type { AuthContext } from '../auth/authContext.ts';
import { getDb, getSqlite } from '../db/client.ts';
import { clients, clientSplitTags } from '../db/schema.ts';
import type { ValidatedAddSplitTagInput } from './splitTagsMapper.ts';

async function hasClient(auth: AuthContext, clientId: string): Promise<boolean> {
  const rows = await getDb()
    .select({ id: clients.id })
    .from(clients)
    .where(and(eq(clients.id, clientId), eq(clients.trainerId, auth.trainerId)))
    .limit(1);

  return rows.length > 0;
}

async function readSplitTags(auth: AuthContext, clientId: string): Promise<SplitTagsResponse> {
  const rows = await getDb()
    .select({ tag: clientSplitTags.tag })
    .from(clientSplitTags)
    .where(and(eq(clientSplitTags.trainerId, auth.trainerId), eq(clientSplitTags.clientId, clientId)))
    .orderBy(asc(clientSplitTags.createdAt), sql`rowid`);

  return { splitTags: rows.map(row => row.tag) };
}

/**
 * Добавляет тег в пул клиента, если в пуле нет того же тега в другом регистре,
 * и возвращает написание из пула. Синхронная: вызывается внутри транзакций плана и тренировки.
 */
export function ensureSplitTag(trainerId: string, clientId: string, tag: string, now: string): string {
  const db = getDb();
  const value = tag.trim();
  const tagKey = toSplitTagKey(value);

  db.insert(clientSplitTags)
    .values({ id: randomUUID(), trainerId, clientId, tag: value, tagKey, createdAt: now })
    .onConflictDoNothing({ target: [clientSplitTags.clientId, clientSplitTags.tagKey] })
    .run();

  const row = db
    .select({ tag: clientSplitTags.tag })
    .from(clientSplitTags)
    .where(and(eq(clientSplitTags.clientId, clientId), eq(clientSplitTags.tagKey, tagKey)))
    .get();
  if (row === undefined) {
    throw new Error('Failed to ensure split tag');
  }

  return row.tag;
}

export async function listSplitTags(auth: AuthContext, clientId: string): Promise<SplitTagsResponse | undefined> {
  if (!(await hasClient(auth, clientId))) {
    return undefined;
  }

  return await readSplitTags(auth, clientId);
}

export async function addSplitTag(
  auth: AuthContext,
  clientId: string,
  input: ValidatedAddSplitTagInput
): Promise<SplitTagsResponse | undefined> {
  if (!(await hasClient(auth, clientId))) {
    return undefined;
  }

  const now = new Date().toISOString();
  getSqlite().transaction(() => {
    ensureSplitTag(auth.trainerId, clientId, input.tag, now);
  })();

  return await readSplitTags(auth, clientId);
}
