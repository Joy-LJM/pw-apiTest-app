import { test as setup } from "@playwright/test";

const authFile='.auth/user.json';

setup.beforeEach(async ({ page }) => {
  await page.goto("https://conduit.bondaracademy.com/");

  await page.getByText("Sign in").click();
  await page.getByRole("textbox", { name: "Email" }).fill("test4@gmail.com");
  await page.getByRole("textbox", { name: "Password" }).fill("12345678");
  await page.getByRole("button").click();
  await page.waitForResponse('https://conduit-api.bondaracademy.com/api/tags');

  // save auth state to file to share between tests
  await page.context().storageState({ path:authFile})
});
