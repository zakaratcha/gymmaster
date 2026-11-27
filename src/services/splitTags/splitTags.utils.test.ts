import { describe, expect, it } from 'vitest';

import { filterSplitTagSuggestions, toSplitTagKey } from './splitTags.utils.ts';

describe('toSplitTagKey', () => {
  it('приводит латиницу в смешанном регистре к нижнему регистру', () => {
    expect(toSplitTagKey('Day A')).toBe(toSplitTagKey('dAY a'));
    expect(toSplitTagKey('PuSh')).toBe('push');
  });

  it('обрезает табуляцию по краям', () => {
    expect(toSplitTagKey('\tноги\t')).toBe('ноги');
  });
});

describe('filterSplitTagSuggestions', () => {
  it('для ввода из одних пробелов возвращает весь пул', () => {
    const tags = ['ноги', 'верх', 'день А'];

    expect(filterSplitTagSuggestions(tags, ' '.repeat(3))).toEqual(tags);
  });
});
