import { describe, expect, it } from 'vitest';

import { readApiErrorMessage } from './api.utils';

describe('readApiErrorMessage', () => {
  it('не возвращает текст для пустой строки error', () => {
    expect(readApiErrorMessage({ error: '' })).toBeUndefined();
  });

  it('не возвращает текст, если тело не объект', () => {
    expect(readApiErrorMessage('Неверный текущий пароль')).toBeUndefined();
    expect(readApiErrorMessage(null)).toBeUndefined();
  });

  it('не возвращает текст, если поля error нет', () => {
    expect(readApiErrorMessage({ message: 'Неверный текущий пароль' })).toBeUndefined();
  });
});
