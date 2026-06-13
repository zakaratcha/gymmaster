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
