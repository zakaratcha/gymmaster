import { authClient } from '../../../../src/services/auth/auth.client';
import { getTestUser, type TestUsername } from './testUsers';

const cookiesByUser = new Map<TestUsername, ReadonlyMap<string, string>>();

export function resetApiSession(): void {
  cookiesByUser.clear();
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
