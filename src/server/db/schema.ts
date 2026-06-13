import { index, integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';

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

export type TrainerRow = typeof trainers.$inferSelect;
export type SessionRow = typeof sessions.$inferSelect;
