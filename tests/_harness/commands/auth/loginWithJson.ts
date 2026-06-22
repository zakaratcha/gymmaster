import { authClient } from '../../../../src/services/auth/auth.client';
import type { AuthResult } from '../../../../src/services/auth/auth.models';
import { resetApiSession } from '../resetApiSession';

export async function loginWithJson(json: string): Promise<AuthResult> {
  await resetApiSession();

  // eslint-disable-next-line @typescript-eslint/no-unsafe-argument -- намеренно невалидные тела login в API-тестах
  return await authClient.login(JSON.parse(json));
}
