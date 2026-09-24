import { index, integer, real, sqliteTable, text } from 'drizzle-orm/sqlite-core';

import type { TrainerStatus } from '../../services/trainers/trainers.models.ts';

export const trainers = sqliteTable('trainers', {
  id: text('id').primaryKey(),
  email: text('email').notNull().unique(),
  password: text('password').notNull(),
  status: text('status').$type<TrainerStatus>().notNull(),
  admin: integer('admin').notNull().default(0),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull()
});

export const sessions = sqliteTable(
  'sessions',
  {
    id: text('id').primaryKey(),
    trainerId: text('trainer_id')
      .notNull()
      .references(() => trainers.id, { onDelete: 'cascade' }),
    expiresAt: text('expires_at').notNull(),
    createdAt: text('created_at').notNull()
  },
  table => [index('idx_sessions_trainer_id').on(table.trainerId)]
);

export const clients = sqliteTable(
  'clients',
  {
    id: text('id').primaryKey(),
    trainerId: text('trainer_id')
      .notNull()
      .references(() => trainers.id, { onDelete: 'cascade' }),
    name: text('name').notNull(),
    notes: text('notes'),
    bodyWeightKg: real('body_weight_kg'),
    createdAt: text('created_at').notNull(),
    updatedAt: text('updated_at').notNull()
  },
  table => [index('idx_clients_trainer_id').on(table.trainerId)]
);

export const exercises = sqliteTable(
  'exercises',
  {
    id: text('id').primaryKey(),
    trainerId: text('trainer_id')
      .notNull()
      .references(() => trainers.id, { onDelete: 'cascade' }),
    name: text('name').notNull(),
    notes: text('notes'),
    archivedAt: text('archived_at'),
    createdAt: text('created_at').notNull(),
    updatedAt: text('updated_at').notNull()
  },
  table => [
    index('idx_exercises_trainer_id').on(table.trainerId),
    index('idx_exercises_trainer_archived').on(table.trainerId, table.archivedAt)
  ]
);

export type TrainerRow = typeof trainers.$inferSelect;
export type SessionRow = typeof sessions.$inferSelect;
export type ClientRow = typeof clients.$inferSelect;
export type ExerciseRow = typeof exercises.$inferSelect;
