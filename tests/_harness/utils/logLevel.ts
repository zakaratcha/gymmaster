type LogLevel = 'trace' | 'debug' | 'info' | 'warn' | 'error' | 'silent';

const levels: LogLevel[] = ['trace', 'debug', 'info', 'warn', 'error', 'silent'];

function readConfiguredLevel(): LogLevel {
  const raw = process.env.API_TEST_LOG ?? process.env.E2E_LOG ?? 'warn';
  if (levels.includes(raw as LogLevel)) {
    return raw as LogLevel;
  }

  return 'warn';
}

const currentLevel = readConfiguredLevel();

export function logLevel(minLevel: LogLevel = 'info'): boolean {
  return levels.indexOf(currentLevel) <= levels.indexOf(minLevel);
}
