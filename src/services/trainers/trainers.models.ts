export type TrainerStatus = 'active' | 'blocked';

export type TrainerRole = 'trainer' | 'platform_admin';

export type Trainer = {
  readonly id: string;
  readonly email: string;
  readonly status: TrainerStatus;
  readonly roles: readonly TrainerRole[];
};
