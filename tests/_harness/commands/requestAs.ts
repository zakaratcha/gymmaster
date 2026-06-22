import { api } from '../../../src/services/api/api.service';
import { installApiFetchLogging } from '../utils/apiFetchLogging';
import { fetchUserSession } from './auth/fetchUserSession';
import { getTestUser, type TestUser } from './auth/testUsers';
import { resetApiSession } from './resetApiSession';

installApiFetchLogging();

api.cache.config.disabled = true;
api.cache.config.maxAge = 0;

export async function requestAs<R, A extends unknown[]>(
  user: TestUser,
  clientMethod: (...args: A) => Promise<R>,
  ...args: A
): Promise<R> {
  await fetchUserSession(user);

  return await clientMethod(...args);
}

export async function requestWithoutAuth<R, A extends unknown[]>(
  clientMethod: (...args: A) => Promise<R>,
  ...args: A
): Promise<R> {
  await resetApiSession();

  return await clientMethod(...args);
}

export const requestAsAdmin = requestAs.bind(null, getTestUser('Администратор')) as <R, A extends unknown[]>(
  clientMethod: (...args: A) => Promise<R>,
  ...args: A
) => Promise<R>;
