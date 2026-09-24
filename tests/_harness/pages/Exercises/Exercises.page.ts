import type { Page as PlaywrightPage } from 'playwright';

import { Page } from '../../classes/Page';

export class ExercisesPage extends Page {
  readonly title = 'Упражнения';
  readonly url = '/exercises';
  readonly selectors = {
    root: '.Exercises',
    title: '.Exercises-Title'
  } as const;

  constructor(page: PlaywrightPage) {
    super(page);
  }
}
