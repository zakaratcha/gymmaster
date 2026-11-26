import { api } from '../../../src/services/api/api.service';
import { installApiFetchLogging } from '../utils/apiFetchLogging';
import { ensureUserCookies, getEmailCookies } from './auth/apiSession';
import type { TestUsername } from './auth/testUsers';
import { withApiCookies } from './withApiCookies';

installApiFetchLogging();

api.cache.config.disabled = true;
api.cache.config.maxAge = 0;

export async function requestAs<R, A extends unknown[]>(
  user: TestUsername,
  clientMethod: (...args: A) => Promise<R>,
  ...args: A
): Promise<R> {
  const cookies = await ensureUserCookies(user);

  return await withApiCookies(cookies, () => clientMethod(...args));
}

export async function requestWithoutAuth<R, A extends unknown[]>(
  clientMethod: (...args: A) => Promise<R>,
  ...args: A
): Promise<R> {
  return await withApiCookies(undefined, () => clientMethod(...args));
}

export async function requestAsTrainer<R, A extends unknown[]>(
  clientMethod: (...args: A) => Promise<R>,
  ...args: A
): Promise<R> {
  return await requestAs('Тренер', clientMethod, ...args);
}

export async function requestWithEmailSession<R, A extends unknown[]>(
  email: string,
  clientMethod: (...args: A) => Promise<R>,
  ...args: A
): Promise<R> {
  const cookies = getEmailCookies(email);
  if (cookies === undefined) {
    throw new Error(`Нет сохранённой сессии для ${email}`);
  }

  return await withApiCookies(cookies, () => clientMethod(...args));
}

export async function requestAsAdmin<R, A extends unknown[]>(
  clientMethod: (...args: A) => Promise<R>,
  ...args: A
): Promise<R> {
  return await requestAs('Администратор', clientMethod, ...args);
}
