import { api } from '../../../src/services/api/api.service';
import { authClient } from '../../../src/services/auth/auth.client';
import { clearCurrentSessionUser } from './auth/sessionState';

export async function resetApiSession(): Promise<void> {
  api.cache.clear();
  clearCurrentSessionUser();

  try {
    await authClient.logout();
  } catch {
    // нет активной сессии
  }
}
