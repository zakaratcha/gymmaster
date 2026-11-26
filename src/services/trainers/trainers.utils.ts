import type { TrainerRole } from './trainers.models.ts';

export function isPlatformAdmin(roles: readonly TrainerRole[] | undefined): boolean {
  return roles?.includes('platform_admin') ?? false;
}
