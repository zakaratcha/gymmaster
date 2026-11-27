import type { AddSplitTagRequest } from '../../services/splitTags/splitTags.models.ts';
import { isArray } from '../../services/util/typeGuards/isArray.ts';

export type ValidatedAddSplitTagInput = AddSplitTagRequest;

type ValidationResult<T> = { readonly ok: true; readonly value: T } | { readonly ok: false; readonly error: string };

export function validateAddSplitTagInput(body: unknown): ValidationResult<ValidatedAddSplitTagInput> {
  if (typeof body !== 'object' || body === null || isArray(body)) {
    return { ok: false, error: 'Некорректное тело запроса' };
  }

  const tag: unknown = Object.hasOwn(body, 'tag') ? Reflect.get(body, 'tag') : undefined;
  if (typeof tag !== 'string' || tag.trim().length === 0) {
    return { ok: false, error: 'Поле tag обязательно' };
  }

  return { ok: true, value: { tag: tag.trim() } };
}
