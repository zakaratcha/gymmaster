import { randomUUID } from 'node:crypto';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { asc, eq, sql } from 'drizzle-orm';
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it } from 'vitest';

import type { AuthContext } from '../auth/authContext.ts';

const dbDir = mkdtempSync(path.join(tmpdir(), 'gm-split-tags-'));
process.env.GYMMASTER_DB_PATH = path.join(dbDir, 'test.db');

type PlansService = typeof import('../plans/plansService.ts');
type WorkoutSessionsService = typeof import('../workoutSessions/workoutSessionsService.ts');
type SplitTagsService = typeof import('./splitTagsService.ts');

type DbApi = {
  migrate(): Promise<void>;
  createPlan: PlansService['createPlan'];
  updatePlan: PlansService['updatePlan'];
  createWorkoutSession: WorkoutSessionsService['createWorkoutSession'];
  ensureSplitTag: SplitTagsService['ensureSplitTag'];
  insertTrainer(id: string): void;
  insertClient(id: string, trainerId: string): void;
  insertPlan(id: string, trainerId: string, clientId: string, splitTag: string): void;
  poolTags(clientId: string): readonly string[];
  exec(statement: string): void;
};

async function loadDbApi(): Promise<DbApi> {
  const { migrate } = await import('../db/migrate.ts');
  const { getDb, getSqlite } = await import('../db/client.ts');
  const { clients, clientSplitTags, plannedWorkouts, trainers } = await import('../db/schema.ts');
  const { createPlan, updatePlan } = await import('../plans/plansService.ts');
  const { createWorkoutSession } = await import('../workoutSessions/workoutSessionsService.ts');
  const { ensureSplitTag } = await import('./splitTagsService.ts');

  return {
    migrate,
    createPlan,
    updatePlan,
    createWorkoutSession,
    ensureSplitTag,
    insertTrainer(id) {
      const now = new Date().toISOString();
      getDb()
        .insert(trainers)
        .values({
          id,
          email: `split-tags-${id}@local`,
          password: 'hash',
          status: 'active',
          admin: 0,
          createdAt: now,
          updatedAt: now
        })
        .run();
    },
    insertClient(id, trainerId) {
      const now = new Date().toISOString();
      getDb().insert(clients).values({ id, trainerId, name: 'Анна', createdAt: now, updatedAt: now }).run();
    },
    insertPlan(id, trainerId, clientId, splitTag) {
      const now = new Date().toISOString();
      getDb()
        .insert(plannedWorkouts)
        .values({ id, trainerId, clientId, plannedDate: '2099-12-31', splitTag, createdAt: now, updatedAt: now })
        .run();
    },
    poolTags(clientId) {
      return getDb()
        .select({ tag: clientSplitTags.tag })
        .from(clientSplitTags)
        .where(eq(clientSplitTags.clientId, clientId))
        .orderBy(asc(clientSplitTags.createdAt), sql`rowid`)
        .all()
        .map(row => row.tag);
    },
    exec(statement) {
      getSqlite().exec(statement);
    }
  };
}

const REJECT_TRIGGER = 'test_reject_split_tag_write';

describe('сведение тега к пулу внутри транзакций', () => {
  let api: DbApi;
  let auth: AuthContext;
  let clientId = '';

  beforeAll(async () => {
    api = await loadDbApi();
    await api.migrate();
    const trainerId = randomUUID();
    api.insertTrainer(trainerId);
    auth = { trainerId, email: `split-tags-${trainerId}@local`, status: 'active', roles: [] };
  });

  beforeEach(() => {
    clientId = randomUUID();
    api.insertClient(clientId, auth.trainerId);
  });

  afterEach(() => {
    api.exec(`DROP TRIGGER IF EXISTS ${REJECT_TRIGGER}`);
  });

  afterAll(() => {
    rmSync(dbDir, { recursive: true, force: true });
  });

  function rejectWrites(event: 'INSERT' | 'UPDATE', table: 'planned_workouts' | 'workout_sessions'): void {
    api.exec(
      `CREATE TRIGGER ${REJECT_TRIGGER} BEFORE ${event} ON ${table} BEGIN SELECT RAISE(ABORT, 'rejected by test'); END`
    );
  }

  it('отказ записи тренировки откатывает добавление тега в пул', async () => {
    rejectWrites('INSERT', 'workout_sessions');

    await expect(api.createWorkoutSession(auth, clientId, { splitTag: 'кардио' })).rejects.toThrow('rejected by test');
    expect(api.poolTags(clientId)).toEqual([]);
  });

  it('отказ записи нового плана откатывает добавление тега в пул', async () => {
    rejectWrites('INSERT', 'planned_workouts');

    await expect(
      api.createPlan(auth, clientId, { plannedDate: '2099-12-31', splitTag: 'спина', exercises: [] })
    ).rejects.toThrow('rejected by test');
    expect(api.poolTags(clientId)).toEqual([]);
  });

  it('отказ изменения плана откатывает добавление тега в пул', async () => {
    const created = await api.createPlan(auth, clientId, {
      plannedDate: '2099-12-31',
      splitTag: 'ноги',
      exercises: []
    });
    if (created === undefined) {
      throw new Error('План не создан');
    }
    rejectWrites('UPDATE', 'planned_workouts');

    await expect(api.updatePlan(auth, clientId, created.plan.id, { splitTag: 'плечи' })).rejects.toThrow(
      'rejected by test'
    );
    expect(api.poolTags(clientId)).toEqual(['ноги']);
  });

  it('старт с плана, сохранённого до пула, записывает тег в написании пула', async () => {
    api.ensureSplitTag(auth.trainerId, clientId, 'ноги', new Date().toISOString());
    const planId = randomUUID();
    api.insertPlan(planId, auth.trainerId, clientId, 'Ноги');

    const started = await api.createWorkoutSession(auth, clientId, { plannedWorkoutId: planId });

    expect(started?.workoutSession.splitTag).toBe('ноги');
    expect(api.poolTags(clientId)).toEqual(['ноги']);
  });
});
