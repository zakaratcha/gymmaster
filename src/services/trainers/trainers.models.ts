export type TrainerStatus = 'active' | 'blocked';

export type TrainerRole = 'trainer' | 'platform_admin';

export type Trainer = {
  readonly id: string;
  readonly email: string;
  readonly status: TrainerStatus;
  readonly roles: readonly TrainerRole[];
};

export type AdminTrainer = {
  readonly id: string;
  readonly email: string;
  readonly status: TrainerStatus;
};

export type AdminTrainersResponse = {
  readonly trainers: readonly AdminTrainer[];
};

export type AdminTrainerResponse = {
  readonly trainer: AdminTrainer;
};

export type CreateTrainerRequest = {
  readonly email: string;
  readonly password: string;
};

export type UpdateTrainerStatusRequest = {
  readonly status: TrainerStatus;
};

export type ResetTrainerPasswordRequest = {
  readonly password: string;
};

export const MIN_TRAINER_PASSWORD_LENGTH = 8;
