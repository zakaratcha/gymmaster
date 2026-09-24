const sessionTimestampFormatter = new Intl.DateTimeFormat('ru-RU', {
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
  month: '2-digit',
  year: 'numeric'
});

export function formatBodyWeightKg(bodyWeightKg: number | undefined): string {
  if (bodyWeightKg === undefined) {
    return '—';
  }

  return `${bodyWeightKg} кг`;
}

export function formatPlannedDate(value: string): string {
  const [year, month, day] = value.split('-');
  return `${day}.${month}.${year}`;
}

export function formatSessionTimestamp(value: string): string {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : sessionTimestampFormatter.format(date);
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
