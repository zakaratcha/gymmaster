export function toSplitTagKey(tag: string): string {
  return tag.trim().toLowerCase();
}

export function filterSplitTagSuggestions(tags: readonly string[], input: string): readonly string[] {
  const inputKey = toSplitTagKey(input);
  if (inputKey.length === 0) {
    return tags;
  }

  return tags.filter(tag => {
    const tagKey = toSplitTagKey(tag);
    return tagKey !== inputKey && tagKey.includes(inputKey);
  });
}
