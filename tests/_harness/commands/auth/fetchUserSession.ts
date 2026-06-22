import { authClient } from '../../../../src/services/auth/auth.client';
import { resetApiSession } from '../resetApiSession';
import { getCurrentSessionUser, setCurrentSessionUser } from './sessionState';
import { type TestUser } from './testUsers';

export { clearCurrentSessionUser } from './sessionState';

export async function fetchUserSession(user: TestUser): Promise<void> {
  if (user.sessionReady === true && getCurrentSessionUser() === user) {
    return;
  }

  await resetApiSession();
  const result = await authClient.login({ email: user.email, password: user.password });

  if (!result.ok) {
    throw new Error(`Не удалось авторизоваться как "${user.email}": ${result.error}`);
  }

  user.sessionReady = true;
  setCurrentSessionUser(user);
}
