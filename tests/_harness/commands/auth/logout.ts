import { authClient } from '../../../../src/services/auth/auth.client';
import { requestAsAdmin } from '../requestAs';
import { resetApiSession } from '../resetApiSession';

export async function logoutViaApi(): Promise<void> {
  await requestAsAdmin(authClient.logout);
}

export async function logoutWithoutSession(): Promise<void> {
  await resetApiSession();
  await authClient.logout();
}
