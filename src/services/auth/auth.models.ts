import type { Trainer } from "../trainers/trainers.models.ts";

export type LoginRequest = {
  readonly email: string;
  readonly password: string;
};

export type CurrentTrainerResponse = {
  readonly trainer: Trainer;
};

export type LoginResponse = {
  readonly trainer: Trainer;
};

export type AuthErrorCode =
  | "invalid_credentials"
  | "validation_error"
  | "forbidden";

export type AuthErrorResponse = {
  readonly error: AuthErrorCode;
};
