import type { LoginRequest } from '../../../../src/services/auth/auth.models';

export type TestUser = LoginRequest & { sessionReady?: boolean };

const testUsers: Record<'Администратор', TestUser> = {
  Администратор: {
    email: 'first-admin@local',
    password: 'changeme'
  }
};

export function getTestUser(username: keyof typeof testUsers): TestUser {
  const user = testUsers[username];

  if (user === undefined) {
    throw new Error(`Не существует тестовый пользователь "${username}"`);
  }

  return user;
}
