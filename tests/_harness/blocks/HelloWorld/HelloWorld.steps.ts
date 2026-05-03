import { Then } from "@cucumber/cucumber";

import type { CustomWorld } from "../../world";
import { HelloWorldBlock } from "./HelloWorld.block";

Then("заголовок блока приветствия {string}", async function (this: CustomWorld, text: string) {
  const block = new HelloWorldBlock(this.page);
  await block.expectTitle(text);
});

Then("отображается успешный ответ API", async function (this: CustomWorld) {
  const block = new HelloWorldBlock(this.page);
  await block.expectApiLineFromServer();
});
