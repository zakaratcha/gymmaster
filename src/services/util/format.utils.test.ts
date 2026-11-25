import { describe, expect, it } from 'vitest';

import {
  formatBodyWeightKg,
  formatPlannedDate,
  formatSessionDate,
  formatSetGroupsText,
  formatSetsText,
  formatVolumeDeltaKg,
  formatVolumeKg,
  formatWeightKg,
  formatWorkoutCount,
  getFirstName,
  truncateNotes
} from './format.utils';

describe('formatWeightKg', () => {
  it('оставляет целый вес без дробной части', () => {
    expect(formatWeightKg(80)).toBe('80');
  });

  it('сохраняет дробный вес', () => {
    expect(formatWeightKg(82.5)).toBe('82.5');
  });

  it('округляет хвост дальше двух знаков', () => {
    expect(formatWeightKg(82.4567)).toBe('82.46');
  });
});

describe('formatVolumeKg', () => {
  it('округляет объём до одного знака', () => {
    expect(formatVolumeKg(1469.04)).toBe('1469');
  });

  it('сохраняет половину', () => {
    expect(formatVolumeKg(1469.5)).toBe('1469.5');
  });
});

describe('formatSetsText', () => {
  it('перечисляет подходы через разделитель', () => {
    expect(formatSetsText([{ reps: 8, weightKg: 80.5 }])).toBe('8×80.5 кг');
    expect(
      formatSetsText([
        { reps: 8, weightKg: 80.5 },
        { reps: 10, weightKg: 82.5 }
      ])
    ).toBe('8×80.5 · 10×82.5 кг');
  });

  it('возвращает прочерк для пустого списка', () => {
    expect(formatSetsText([])).toBe('—');
  });
});

describe('formatSetGroupsText', () => {
  it('сворачивает подряд идущие одинаковые подходы', () => {
    expect(
      formatSetGroupsText([
        { reps: 8, weightKg: 82.5 },
        { reps: 8, weightKg: 82.5 },
        { reps: 8, weightKg: 82.5 },
        { reps: 8, weightKg: 82.5 }
      ])
    ).toBe('4×8@82.5');
  });

  it('группирует только соседние равные подходы', () => {
    expect(
      formatSetGroupsText([
        { reps: 8, weightKg: 80 },
        { reps: 8, weightKg: 80 },
        { reps: 6, weightKg: 85 }
      ])
    ).toBe('2×8@80 · 1×6@85');
  });

  it('не объединяет одинаковые подходы не подряд', () => {
    expect(
      formatSetGroupsText([
        { reps: 8, weightKg: 80 },
        { reps: 6, weightKg: 85 },
        { reps: 8, weightKg: 80 }
      ])
    ).toBe('1×8@80 · 1×6@85 · 1×8@80');
  });

  it('сохраняет порядок разных вхождений', () => {
    expect(
      formatSetGroupsText([
        { reps: 8, weightKg: 80 },
        { reps: 5, weightKg: 100 }
      ])
    ).toBe('1×8@80 · 1×5@100');
  });

  it('возвращает прочерк для пустого списка', () => {
    expect(formatSetGroupsText([])).toBe('—');
  });
});

describe('formatVolumeDeltaKg', () => {
  it('показывает знак плюс для роста объёма', () => {
    expect(formatVolumeDeltaKg(181)).toBe('+181 кг');
  });

  it('показывает минус для падения объёма', () => {
    expect(formatVolumeDeltaKg(-181.5)).toBe('-181.5 кг');
  });

  it('показывает ноль без знака', () => {
    expect(formatVolumeDeltaKg(0)).toBe('0 кг');
  });

  it('не ставит знак, если после округления дельта нулевая', () => {
    expect(formatVolumeDeltaKg(0.04)).toBe('0 кг');
    expect(formatVolumeDeltaKg(-0.04)).toBe('0 кг');
    expect(formatVolumeDeltaKg(0.1 + 0.2 - 0.3)).toBe('0 кг');
  });

  it('округляет малую дельту до одного знака', () => {
    expect(formatVolumeDeltaKg(0.05)).toBe('+0.1 кг');
    expect(formatVolumeDeltaKg(-0.05)).toBe('-0.1 кг');
  });
});

describe('formatWorkoutCount', () => {
  it('склоняет существительное по числу', () => {
    expect(formatWorkoutCount(1, 'упражнение', 'упражнения', 'упражнений')).toBe('1 упражнение');
    expect(formatWorkoutCount(2, 'упражнение', 'упражнения', 'упражнений')).toBe('2 упражнения');
    expect(formatWorkoutCount(5, 'упражнение', 'упражнения', 'упражнений')).toBe('5 упражнений');
  });

  it('не склоняет числа, оканчивающиеся на 11–14', () => {
    expect(formatWorkoutCount(11, 'подход', 'подхода', 'подходов')).toBe('11 подходов');
  });
});

describe('getFirstName', () => {
  it('берёт первое слово', () => {
    expect(getFirstName('Анна Иванова')).toBe('Анна');
  });
});

describe('formatBodyWeightKg', () => {
  it('возвращает прочерк без веса', () => {
    expect(formatBodyWeightKg()).toBe('—');
  });

  it('добавляет килограммы', () => {
    expect(formatBodyWeightKg(72)).toBe('72 кг');
  });
});

describe('formatSessionDate', () => {
  it('переводит момент в локальную дату без времени', () => {
    const value = '2026-05-07T11:00:00.000Z';
    const expected = new Intl.DateTimeFormat('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }).format(new Date(value));

    expect(formatSessionDate(value)).toBe(expected);
    expect(formatSessionDate(value)).toMatch(/^\d{2}\.\d{2}\.\d{4}$/);
  });

  it('оставляет как есть некорректную строку', () => {
    expect(formatSessionDate('не дата')).toBe('не дата');
  });
});

describe('formatPlannedDate', () => {
  it('переводит дату в привычный вид', () => {
    expect(formatPlannedDate('2026-05-07')).toBe('07.05.2026');
  });

  it('оставляет как есть значение не по формату', () => {
    expect(formatPlannedDate('завтра')).toBe('завтра');
  });
});

describe('truncateNotes', () => {
  it('не трогает короткие заметки', () => {
    expect(truncateNotes('коротко', 10)).toBe('коротко');
  });

  it('обрезает длинные заметки', () => {
    expect(truncateNotes('длинная заметка', 6)).toBe('длинна…');
  });
});
