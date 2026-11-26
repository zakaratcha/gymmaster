import type { Trainer } from '../trainers/trainers.models.ts';

export type LoginRequest = {
  readonly email: string;
  readonly password: string;
};

export type AuthResult =
  | { readonly ok: true; readonly trainer: Trainer }
  | { readonly ok: false; readonly error: string };

export type CurrentTrainerResponse = {
  readonly trainer: Trainer;
};

export type ChangePasswordRequest = {
  readonly currentPassword: string;
  readonly newPassword: string;
};

export type ChangePasswordForm = ChangePasswordRequest & {
  readonly repeatPassword: string;
};

export type ChangePasswordResult = { readonly ok: true } | { readonly ok: false; readonly error: string };

export const PASSWORD_MISMATCH_ERROR = 'Пароли не совпадают';

export const CHANGE_PASSWORD_FAILED_ERROR = 'Не удалось сменить пароль';
