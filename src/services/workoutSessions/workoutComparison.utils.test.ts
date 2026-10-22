import { describe, expect, it } from 'vitest';

import type { PlannedWorkout } from '../plans/plans.models.ts';
import { buildWorkoutComparison, calculateVolumeKg } from './workoutComparison.utils.ts';
import type { WorkoutSession } from './workoutSessions.models.ts';

const plan: PlannedWorkout = {
  id: 'plan-1',
  clientId: 'client-1',
  plannedDate: '2099-12-31',
  splitTag: 'ноги',
  exercises: [
    { exerciseId: 'squat', exerciseName: 'Присед', sets: [{ reps: 8, weightKg: 80 }] },
    { exerciseId: 'bench', exerciseName: 'Жим', sets: [{ reps: 10, weightKg: 50 }] }
  ]
};

const session: WorkoutSession = {
  id: 'session-1',
  clientId: 'client-1',
  plannedWorkoutId: 'plan-1',
  splitTag: 'ноги',
  status: 'completed',
  startedAt: '2026-05-07T10:00:00.000Z',
  completedAt: '2026-05-07T11:00:00.000Z',
  exercises: [{ exerciseId: 'squat', exerciseName: 'Присед', sets: [{ reps: 8, weightKg: 82.5 }] }],
  plan
};

describe('calculateVolumeKg', () => {
  it('складывает объём подходов', () => {
    expect(
      calculateVolumeKg([
        { reps: 8, weightKg: 80 },
        { reps: 10, weightKg: 50 }
      ])
    ).toBe(1140);
  });

  it('считает пустой набор нулём', () => {
    expect(calculateVolumeKg([])).toBe(0);
  });
});

describe('buildWorkoutComparison', () => {
  it('отмечает упражнение, выполненное с другой нагрузкой', () => {
    const comparison = buildWorkoutComparison(plan, session);
    const squat = comparison.rows.find(row => row.exerciseId === 'squat');

    expect(squat?.status).toBe('deviated');
    expect(squat?.planText).toBe('8×80 кг');
    expect(squat?.factText).toBe('8×82.5 кг');
    expect(squat?.planVolumeKg).toBe(640);
    expect(squat?.factVolumeKg).toBe(660);
  });

  it('отмечает упражнение, которого нет в факте', () => {
    const comparison = buildWorkoutComparison(plan, session);
    const bench = comparison.rows.find(row => row.exerciseId === 'bench');

    expect(bench?.status).toBe('not_done');
    expect(bench?.planText).toBe('10×50 кг');
    expect(bench?.factText).toBe('—');
  });

  it('отмечает совпадение, когда подходы те же', () => {
    const comparison = buildWorkoutComparison(plan, {
      ...session,
      exercises: [
        { exerciseId: 'squat', exerciseName: 'Присед', sets: [{ reps: 8, weightKg: 80 }] },
        { exerciseId: 'bench', exerciseName: 'Жим', sets: [{ reps: 10, weightKg: 50 }] }
      ]
    });

    expect(comparison.rows.map(row => row.status)).toEqual(['matched', 'matched']);
  });

  it('отмечает упражнение, которого не было в плане', () => {
    const comparison = buildWorkoutComparison(plan, {
      ...session,
      exercises: [
        { exerciseId: 'squat', exerciseName: 'Присед', sets: [{ reps: 8, weightKg: 82.5 }] },
        { exerciseId: 'row', exerciseName: 'Тяга', sets: [{ reps: 5, weightKg: 100 }] }
      ]
    });

    const row = comparison.rows.find(item => item.exerciseId === 'row');
    expect(row?.status).toBe('extra');
    expect(row?.planText).toBe('—');
    expect(row?.factText).toBe('5×100 кг');
  });

  it('считает сводку по плану и по факту', () => {
    const comparison = buildWorkoutComparison(plan, session);

    expect(comparison.planTotals).toEqual({ exerciseCount: 2, setCount: 2, volumeKg: 1140 });
    expect(comparison.factTotals).toEqual({ exerciseCount: 1, setCount: 1, volumeKg: 660 });
  });

  it('не строит строк без плана', () => {
    const comparison = buildWorkoutComparison(null, session);

    expect(comparison.rows).toEqual([]);
    expect(comparison.planTotals).toEqual({ exerciseCount: 0, setCount: 0, volumeKg: 0 });
  });
});
