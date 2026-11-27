import { Then, When } from '@cucumber/cucumber';

import type { CustomWorld } from '../../world';
import { SplitTagFieldBlock } from './SplitTagField.block';

function parseTags(value: string): readonly string[] {
  return value.split(',').map(tag => tag.trim());
}

When('я ввожу в поле тега {string}', async function (this: CustomWorld, value: string) {
  await new SplitTagFieldBlock(this.page).fill(value);
});

When('я выбираю подсказку тега {string}', async function (this: CustomWorld, tag: string) {
  await new SplitTagFieldBlock(this.page).chooseSuggestion(tag);
});

Then('подсказки тега показывают {string}', async function (this: CustomWorld, tags: string) {
  await new SplitTagFieldBlock(this.page).expectSuggestions(parseTags(tags));
});

Then('подсказки тега не показывают {string}', async function (this: CustomWorld, tag: string) {
  await new SplitTagFieldBlock(this.page).expectSuggestionAbsent(tag);
});

Then('подсказки тега не показывают ни одного тега', async function (this: CustomWorld) {
  await new SplitTagFieldBlock(this.page).expectNoSuggestions();
});
