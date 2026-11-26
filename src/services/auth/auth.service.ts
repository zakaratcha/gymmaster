import { currentUserStore } from '../../stores/currentUser.store';
import { workoutTabsStore } from '../../stores/workoutTabs.store';
import { ApiError } from '../api/api.models';
import { readApiErrorMessage } from '../api/api.utils';
import { authClient } from './auth.client';
import {
  type AuthResult,
  CHANGE_PASSWORD_FAILED_ERROR,
  type ChangePasswordForm,
  type ChangePasswordResult,
  type LoginRequest,
  PASSWORD_MISMATCH_ERROR
} from './auth.models';

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

function resetSession(): void {
  currentUserStore.reset();
  workoutTabsStore.reset();
}

export async function logout(): Promise<void> {
  await authClient.logout();
  resetSession();
}

export async function changeOwnPassword(form: ChangePasswordForm): Promise<ChangePasswordResult> {
  if (form.newPassword !== form.repeatPassword) {
    return { ok: false, error: PASSWORD_MISMATCH_ERROR };
  }

  try {
    await authClient.changePassword({ currentPassword: form.currentPassword, newPassword: form.newPassword });
    return { ok: true };
  } catch (error) {
    if (!(error instanceof ApiError)) {
      return { ok: false, error: CHANGE_PASSWORD_FAILED_ERROR };
    }

    if (error.status === 403) {
      resetSession();
    }

    return { ok: false, error: readApiErrorMessage(error.body) ?? CHANGE_PASSWORD_FAILED_ERROR };
  }
}
