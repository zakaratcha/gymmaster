import type { TrainerRole, TrainerStatus } from '../../services/trainers/trainers.models.ts';

export type AuthContext = {
  readonly trainerId: string;
  readonly email: string;
  readonly status: TrainerStatus;
  readonly roles: readonly TrainerRole[];
};

declare global {
  namespace Express {
    interface Request {
      auth?: AuthContext;
      cookies: Record<string, string>;
      signedCookies: Record<string, string>;
    }
  }
}
