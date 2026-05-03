import { After, Before, setDefaultTimeout, setWorldConstructor } from "@cucumber/cucumber";
import { chromium } from "playwright";

import { getHeadless } from "./config/env";
import { CustomWorld } from "./world";

setWorldConstructor(CustomWorld);
setDefaultTimeout(30 * 1000);

Before(async function (this: CustomWorld) {
  this.browser = await chromium.launch({ headless: getHeadless() });
  this.context = await this.browser.newContext();
  this.page = await this.context.newPage();
});

After(async function (this: CustomWorld) {
  await this.context?.close();
  await this.browser?.close();
});
