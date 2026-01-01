import { test as setup } from "@playwright/test";

setup("authenticate and save storage state", async ({ page }) => {
  await page.goto("https://conduit.bondaracademy.com/");
  await page.getByText("Sign in").click();
  await page.getByRole("textbox", { name: "Email" }).fill("test4@gmail.com");
  await page.getByRole("textbox", { name: "Password" }).fill("12345678");
  await page.getByRole("button").click();

  // Save storage state to .auth/user.json
  await page.context().storageState({ path: ".auth/user.json" });
});
