import { authClient } from '../../../../src/services/auth/auth.client';
import type { AuthResult } from '../../../../src/services/auth/auth.models';
import { getTestUser, type TestUsername } from './testUsers';

const cookiesByUser = new Map<TestUsername, ReadonlyMap<string, string>>();
const cookiesByEmail = new Map<string, ReadonlyMap<string, string>>();
const rememberedCookiesByEmail = new Map<string, ReadonlyMap<string, string>>();

export function resetApiSession(): void {
  cookiesByUser.clear();
  cookiesByEmail.clear();
  rememberedCookiesByEmail.clear();
}

export function getEmailCookies(email: string): ReadonlyMap<string, string> | undefined {
  return cookiesByEmail.get(email);
}

export function setEmailCookies(email: string, cookies: ReadonlyMap<string, string>): void {
  cookiesByEmail.set(email, cookies);
}

export function rememberEmailSession(email: string): void {
  const cookies = cookiesByEmail.get(email);
  if (cookies === undefined) {
    throw new Error(`Нет сохранённой сессии для ${email}`);
  }

  rememberedCookiesByEmail.set(email, cookies);
}

export function getRememberedEmailCookies(email: string): ReadonlyMap<string, string> | undefined {
  return rememberedCookiesByEmail.get(email);
}

export async function loginWithCredentials(email: string, password: string): Promise<AuthResult> {
  const collected = new Map<string, string>();
  const result = await authClient.login({ email, password }, { collectCookies: collected });

  if (result.ok) {
    cookiesByEmail.set(email, collected);
  }

  return result;
}

async function loginAndStore(name: TestUsername): Promise<ReadonlyMap<string, string>> {
  const { email, password } = getTestUser(name);
  const collected = new Map<string, string>();
  const result = await authClient.login({ email, password }, { collectCookies: collected });

  if (!result.ok) {
    throw new Error(`Не удалось авторизоваться как "${email}": ${result.error}`);
  }

  cookiesByUser.set(name, collected);

  return collected;
}

export async function ensureUserCookies(name: TestUsername): Promise<ReadonlyMap<string, string>> {
  const cached = cookiesByUser.get(name);

  if (cached !== undefined) {
    return cached;
  }

  return await loginAndStore(name);
}
