import type { Page as PlaywrightPage } from "playwright";

import { Page } from "../../classes/Page";

const MAIN_SELECTORS = {
  root: ".HelloWorld",
  title: ".HelloWorld-Title",
  apiLine: ".HelloWorld-ApiLine",
} as const;

export class MainPage extends Page<typeof MAIN_SELECTORS> {
  readonly title = "Главная";
  readonly url = "/";
  readonly selectors = MAIN_SELECTORS;

  constructor(page: PlaywrightPage) {
    super(page);
  }
}
