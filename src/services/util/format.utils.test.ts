import { describe, expect, it } from 'vitest';

import {
  formatBodyWeightKg,
  formatPlannedDate,
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
