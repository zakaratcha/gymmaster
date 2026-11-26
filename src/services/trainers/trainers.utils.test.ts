import { describe, expect, it } from 'vitest';

import type { TrainerRole } from './trainers.models.ts';
import { isPlatformAdmin } from './trainers.utils.ts';

describe('isPlatformAdmin', () => {
  it('роль platform_admin даёт доступ', () => {
    expect(isPlatformAdmin(['trainer', 'platform_admin'])).toBe(true);
  });

  it('роли тренера недостаточно', () => {
    expect(isPlatformAdmin(['trainer'])).toBe(false);
  });

  it('пустое значение не даёт доступ', () => {
    const roles: readonly TrainerRole[] | undefined = undefined;
    expect(isPlatformAdmin(roles)).toBe(false);
    expect(isPlatformAdmin([])).toBe(false);
  });
});
