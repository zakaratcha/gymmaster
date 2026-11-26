import { authClient } from '../../../../src/services/auth/auth.client';
import type { ChangePasswordRequest } from '../../../../src/services/auth/auth.models';
import type { Trainer } from '../../../../src/services/trainers/trainers.models';
import { requireScenarioTrainer, requireSecondScenarioTrainer } from '../admin/scenarioTrainer';
import { requestWithEmailSession, requestWithoutAuth } from '../requestAs';
import { withApiCookies } from '../withApiCookies';
import { getEmailCookies, getRememberedEmailCookies, rememberEmailSession, setEmailCookies } from './apiSession';

const SESSION_COOKIE = 'gm_session';

async function changeScenarioTrainerPasswordWithBody(body: unknown): Promise<void> {
  const { email } = requireScenarioTrainer();
  rememberEmailSession(email);

  const collected = new Map<string, string>();
  await requestWithEmailSession(email, authClient.changePassword, body as ChangePasswordRequest, {
    collectCookies: collected
  });

  if (!collected.has(SESSION_COOKIE)) {
    throw new Error('Ответ на смену пароля не содержит cookie новой сессии');
  }

  setEmailCookies(email, collected);
}

export async function changeScenarioTrainerPassword(currentPassword: string, newPassword: string): Promise<void> {
  await changeScenarioTrainerPasswordWithBody({ currentPassword, newPassword });
}

export async function changeScenarioTrainerPasswordWithJson(json: string): Promise<void> {
  await changeScenarioTrainerPasswordWithBody(JSON.parse(json));
}

export async function changeScenarioTrainerPasswordWithSecondTrainerIds(
  currentPassword: string,
  newPassword: string
): Promise<void> {
  const second = requireSecondScenarioTrainer();
  if (second.id === undefined) {
    throw new Error('У второй учётки сценария нет id');
  }

  await changeScenarioTrainerPasswordWithBody({
    currentPassword,
    newPassword,
    id: second.id,
    trainerId: second.id,
    email: second.email
  });
}

export async function changePasswordWithoutSession(currentPassword: string, newPassword: string): Promise<void> {
  await requestWithoutAuth(authClient.changePassword, { currentPassword, newPassword });
}

export async function changePasswordWithoutSessionWithJson(json: string): Promise<void> {
  await requestWithoutAuth(authClient.changePassword, JSON.parse(json) as ChangePasswordRequest);
}

export function rememberScenarioTrainerSession(): void {
  rememberEmailSession(requireScenarioTrainer().email);
}

function requireRememberedCookies(email: string): ReadonlyMap<string, string> {
  const cookies = getRememberedEmailCookies(email);
  if (cookies === undefined) {
    throw new Error(`Нет запомненной сессии для ${email}`);
  }

  return cookies;
}

export async function readScenarioTrainerWithRememberedSession(): Promise<Trainer> {
  const cookies = requireRememberedCookies(requireScenarioTrainer().email);
  const response = await withApiCookies(cookies, () => authClient.getCurrentUser());
  return response.trainer;
}

export async function readScenarioTrainerWithResponseSession(): Promise<Trainer> {
  const { email } = requireScenarioTrainer();
  const cookies = getEmailCookies(email);
  if (cookies === undefined || cookies === requireRememberedCookies(email)) {
    throw new Error(`Нет сессии из ответа на смену пароля для ${email}`);
  }

  const response = await withApiCookies(cookies, () => authClient.getCurrentUser());
  return response.trainer;
}
