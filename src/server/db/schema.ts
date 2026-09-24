import { index, integer, real, sqliteTable, text, unique } from 'drizzle-orm/sqlite-core';

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

export const plannedWorkouts = sqliteTable(
  'planned_workouts',
  {
    id: text('id').primaryKey(),
    trainerId: text('trainer_id')
      .notNull()
      .references(() => trainers.id, { onDelete: 'cascade' }),
    clientId: text('client_id')
      .notNull()
      .references(() => clients.id, { onDelete: 'cascade' }),
    plannedDate: text('planned_date').notNull(),
    splitTag: text('split_tag').notNull(),
    createdAt: text('created_at').notNull(),
    updatedAt: text('updated_at').notNull()
  },
  table => [index('idx_planned_workouts_trainer_client_date').on(table.trainerId, table.clientId, table.plannedDate)]
);

export const plannedExercises = sqliteTable(
  'planned_exercises',
  {
    id: text('id').primaryKey(),
    trainerId: text('trainer_id')
      .notNull()
      .references(() => trainers.id, { onDelete: 'cascade' }),
    plannedWorkoutId: text('planned_workout_id')
      .notNull()
      .references(() => plannedWorkouts.id, { onDelete: 'cascade' }),
    exerciseId: text('exercise_id')
      .notNull()
      .references(() => exercises.id),
    position: integer('position').notNull(),
    createdAt: text('created_at').notNull(),
    updatedAt: text('updated_at').notNull()
  },
  table => [
    index('idx_planned_exercises_workout_position').on(table.trainerId, table.plannedWorkoutId, table.position),
    unique('uq_planned_exercises_workout_position').on(table.plannedWorkoutId, table.position)
  ]
);

export const plannedSets = sqliteTable(
  'planned_sets',
  {
    id: text('id').primaryKey(),
    trainerId: text('trainer_id')
      .notNull()
      .references(() => trainers.id, { onDelete: 'cascade' }),
    plannedExerciseId: text('planned_exercise_id')
      .notNull()
      .references(() => plannedExercises.id, { onDelete: 'cascade' }),
    position: integer('position').notNull(),
    reps: integer('reps').notNull(),
    weightKg: real('weight_kg').notNull(),
    createdAt: text('created_at').notNull(),
    updatedAt: text('updated_at').notNull()
  },
  table => [
    index('idx_planned_sets_exercise_position').on(table.trainerId, table.plannedExerciseId, table.position),
    unique('uq_planned_sets_exercise_position').on(table.plannedExerciseId, table.position)
  ]
);

export type TrainerRow = typeof trainers.$inferSelect;
export type SessionRow = typeof sessions.$inferSelect;
export type ClientRow = typeof clients.$inferSelect;
export type ExerciseRow = typeof exercises.$inferSelect;
export type PlannedWorkoutRow = typeof plannedWorkouts.$inferSelect;
export type PlannedExerciseRow = typeof plannedExercises.$inferSelect;
export type PlannedSetRow = typeof plannedSets.$inferSelect;
