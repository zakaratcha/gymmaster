const sessionTimestampFormatter = new Intl.DateTimeFormat('ru-RU', {
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
  month: '2-digit',
  year: 'numeric'
});

const plannedDatePattern = /^\d{4}-\d{2}-\d{2}$/;

export function getFirstName(name: string): string {
  const [firstName] = name.trim().split(/\s+/);
  return firstName ?? name;
}

export function formatBodyWeightKg(bodyWeightKg?: number): string {
  if (bodyWeightKg === undefined) {
    return '—';
  }

  return `${bodyWeightKg} кг`;
}

export function formatPlannedDate(value: string): string {
  if (!plannedDatePattern.test(value)) {
    return value;
  }

  const [year, month, day] = value.split('-');
  const parsed = new Date(`${value}T00:00:00`);
  if (
    parsed.getFullYear() !== Number(year) ||
    parsed.getMonth() + 1 !== Number(month) ||
    parsed.getDate() !== Number(day)
  ) {
    return value;
  }

  return `${day}.${month}.${year}`;
}

export function formatSessionTimestamp(value: string): string {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : sessionTimestampFormatter.format(date);
}

export function formatWeightKg(value: number): string {
  return `${Number(value.toFixed(2))}`;
}

export function formatVolumeKg(value: number): string {
  return `${Number(value.toFixed(1))}`;
}

export function formatSetsText(sets: readonly { readonly reps: number; readonly weightKg: number }[]): string {
  if (sets.length === 0) {
    return '—';
  }

  const parts = sets.map(set => `${set.reps}×${formatWeightKg(set.weightKg)}`);
  return `${parts.join(' · ')} кг`;
}

export function formatVolumeDeltaKg(value: number): string {
  if (value === 0) {
    return '0 кг';
  }

  return `${value > 0 ? '+' : '-'}${formatVolumeKg(Math.abs(value))} кг`;
}

export function formatWorkoutCount(value: number, singular: string, paucal: string, plural: string): string {
  const lastTwoDigits = value % 100;
  const lastDigit = value % 10;
  let noun = plural;
  if (lastDigit === 1 && (lastTwoDigits < 11 || lastTwoDigits > 14)) {
    noun = singular;
  } else if (lastDigit >= 2 && lastDigit <= 4 && (lastTwoDigits < 12 || lastTwoDigits > 14)) {
    noun = paucal;
  }
  return `${value} ${noun}`;
}

export function truncateNotes(notes: string, maxLength: number): string {
  if (notes.length <= maxLength) {
    return notes;
  }

  return `${notes.slice(0, maxLength).trimEnd()}…`;
}
