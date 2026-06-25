import type { LoginRequest } from '../../../../src/services/auth/auth.models';

export type TestUsername = 'Администратор' | 'Тренер';

export type TestUser = LoginRequest;

const testUsers: Record<TestUsername, TestUser> = {
  Администратор: {
    email: 'first-admin@local',
    password: 'changeme'
  },
  Тренер: {
    email: 'second-trainer@local',
    password: 'changeme'
  }
};

export function getTestUser(name: TestUsername): TestUser {
  return testUsers[name];
}

export function getTestUsernameByEmail(email: string): TestUsername | undefined {
  return (Object.keys(testUsers) as TestUsername[]).find(name => testUsers[name].email === email);
}
