import type { TestUser } from './testUsers';

let currentSessionUser: TestUser | undefined;

export function clearCurrentSessionUser(): void {
  currentSessionUser = undefined;
}

export function getCurrentSessionUser(): TestUser | undefined {
  return currentSessionUser;
}

export function setCurrentSessionUser(user: TestUser): void {
  currentSessionUser = user;
}
