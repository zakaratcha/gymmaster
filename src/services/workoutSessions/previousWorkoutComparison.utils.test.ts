import { describe, expect, it } from 'vitest';

import { buildPreviousWorkoutComparison } from './previousWorkoutComparison.utils.ts';
import type { WorkoutSession, WorkoutSessionExercise } from './workoutSessions.models.ts';

function session(id: string, exercises: readonly WorkoutSessionExercise[]): WorkoutSession {
  return {
    id,
    clientId: 'client-1',
    splitTag: 'ноги',
    status: 'completed',
    startedAt: '2026-04-05T10:00:00.000Z',
    completedAt: '2026-04-05T11:00:00.000Z',
    exercises,
    plan: null
  };
}

function exercise(exerciseId: string, exerciseName: string, reps: number, weightKg: number): WorkoutSessionExercise {
  return { exerciseId, exerciseName, sets: [{ reps, weightKg }] };
}

describe('buildPreviousWorkoutComparison', () => {
  it('общее упражнение показывает подходы обеих тренировок', () => {
    const comparison = buildPreviousWorkoutComparison(
      session('previous', [exercise('squat', 'Присед', 8, 80)]),
      session('current', [exercise('squat', 'Присед', 8, 82.5)])
    );

    expect(comparison.rows).toEqual([
      {
        exerciseId: 'squat',
        exerciseName: 'Присед',
        previousText: '8×80 кг',
        currentText: '8×82.5 кг',
        previousVolumeKg: 640,
        currentVolumeKg: 660
      }
    ]);
  });

  it('объём вырос на разницу произведений повторов и веса', () => {
    const comparison = buildPreviousWorkoutComparison(
      session('previous', [exercise('squat', 'Присед', 8, 80)]),
      session('current', [exercise('squat', 'Присед', 8, 82.5)])
    );

    expect(comparison.previousVolumeKg).toBe(640);
    expect(comparison.currentVolumeKg).toBe(660);
  });

  it('упражнение только в текущей тренировке получает прочерк в прошлой', () => {
    const comparison = buildPreviousWorkoutComparison(
      session('previous', []),
      session('current', [exercise('row', 'Тяга', 5, 100)])
    );

    expect(comparison.rows).toEqual([
      {
        exerciseId: 'row',
        exerciseName: 'Тяга',
        previousText: '—',
        currentText: '5×100 кг',
        previousVolumeKg: 0,
        currentVolumeKg: 500
      }
    ]);
  });

  it('упражнение только в прошлой тренировке получает прочерк в текущей', () => {
    const comparison = buildPreviousWorkoutComparison(
      session('previous', [exercise('bench', 'Жим', 10, 50)]),
      session('current', [])
    );

    expect(comparison.rows).toEqual([
      {
        exerciseId: 'bench',
        exerciseName: 'Жим',
        previousText: '10×50 кг',
        currentText: '—',
        previousVolumeKg: 500,
        currentVolumeKg: 0
      }
    ]);
  });

  it('точное совпадение имеет приоритет над порядком', () => {
    const comparison = buildPreviousWorkoutComparison(
      session('previous', [exercise('squat', 'Присед', 8, 80), exercise('squat', 'Присед', 5, 90)]),
      session('current', [exercise('squat', 'Присед', 5, 100), exercise('squat', 'Присед', 8, 80)])
    );

    expect(comparison.rows.map(row => [row.previousText, row.currentText])).toEqual([
      ['5×90 кг', '5×100 кг'],
      ['8×80 кг', '8×80 кг']
    ]);
  });

  it('лишнее вхождение без пары показывается отдельной строкой', () => {
    const comparison = buildPreviousWorkoutComparison(
      session('previous', [exercise('squat', 'Присед', 6, 85)]),
      session('current', [exercise('squat', 'Присед', 8, 80), exercise('squat', 'Присед', 6, 85)])
    );

    expect(comparison.rows.map(row => [row.previousText, row.currentText])).toEqual([
      ['—', '8×80 кг'],
      ['6×85 кг', '6×85 кг']
    ]);
  });

  it('упражнения только из прошлой идут в конце', () => {
    const comparison = buildPreviousWorkoutComparison(
      session('previous', [exercise('bench', 'Жим', 10, 50), exercise('squat', 'Присед', 8, 80)]),
      session('current', [exercise('row', 'Тяга', 5, 100), exercise('squat', 'Присед', 8, 82.5)])
    );

    expect(comparison.rows.map(row => row.exerciseName)).toEqual(['Тяга', 'Присед', 'Жим']);
  });

  it('пустые сессии не дают строк и имеют нулевой объём', () => {
    const comparison = buildPreviousWorkoutComparison(session('previous', []), session('current', []));

    expect(comparison.rows).toEqual([]);
    expect(comparison.previousVolumeKg).toBe(0);
    expect(comparison.currentVolumeKg).toBe(0);
  });
});
