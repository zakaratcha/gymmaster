import { currentUserStore } from '../../stores/currentUser.store';
import { authClient } from './auth.client';
import type { AuthResult, LoginRequest } from './auth.models';

let checkAuthPromise: Promise<void> | undefined;

async function runCheckAuth(): Promise<void> {
  try {
    const response = await authClient.getCurrentUser();
    currentUserStore.setTrainer(response.trainer);
  } catch {
    currentUserStore.reset();
  } finally {
    currentUserStore.setInited(true);
  }
}

export function checkAuth(): Promise<void> {
  checkAuthPromise ??= runCheckAuth();

  return checkAuthPromise;
}

export async function authenticate(credentials: LoginRequest): Promise<AuthResult> {
  const result = await authClient.login(credentials);
  if (result.ok) {
    currentUserStore.setTrainer(result.trainer);
  }

  return result;
}

export async function logout(): Promise<void> {
  await authClient.logout();
  currentUserStore.reset();
}
