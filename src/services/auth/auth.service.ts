import { currentUserStore } from '../../stores/currentUser.store';
import { authClient } from './auth.client';
import type { AuthResult, LoginRequest } from './auth.models';

export async function checkAuth(): Promise<void> {
  try {
    const response = await authClient.getCurrentUser();
    currentUserStore.setTrainer(response.trainer);
  } catch {
    currentUserStore.reset();
  }
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
