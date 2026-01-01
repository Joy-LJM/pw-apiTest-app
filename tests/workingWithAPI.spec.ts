import { test, expect } from "@playwright/test";
import tags from "../test-data/tags.json";

test.beforeEach(async ({ page }) => {
  // intercept request and provide mock data
  await page.route(
    "https://conduit-api.bondaracademy.com/api/tags",
    async (route) => {
      await route.fulfill({
        body: JSON.stringify(tags),
      });
    }
  );

  await page.goto("https://conduit.bondaracademy.com/");
  // await page.getByText("Sign in").click();
  // await page.getByRole("textbox", { name: "Email" }).fill("test4@gmail.com");
  // await page.getByRole("textbox", { name: "Password" }).fill("12345678");
  // await page.getByRole("button").click();
});

test("has title", async ({ page }) => {
  await page.route(
    "https://conduit-api.bondaracademy.com/api/articles?limit=10&offset=0",
    async (route) => {
      try {
        const res = await route.fetch();
        const resBody = await res.json();
        resBody.articles[0].title = "This is a test title";
        resBody.articles[0].description = "This is a test description";

        await route.fulfill({
          body: JSON.stringify(resBody),
        });
      } catch (error) {
        console.error("Error during route handling:", error);
        throw error;
      }
    }
  );

  try {
    await page.goto("https://conduit.bondaracademy.com/"); // Ensure the page is loaded
    await expect(page.locator(".navbar-brand")).toHaveText("conduit");
    await page.getByText("Global Feed").click();
    await expect(page.locator("app-article-list h1").first()).toContainText(
      "This is a test title"
    );
  } catch (error) {
    console.error("Test failed due to unexpected error:", error);
    throw error;
  }
});
test("create article", async ({ page, request }) => {
  await page.goto("https://conduit.bondaracademy.com/"); // Ensure page is loaded
  await page.waitForSelector("text=New Article", { timeout: 60000 }); // Explicit wait with increased timeout

  const isVisible = await page.isVisible("text=New Article");
  if (!isVisible) {
    console.error(
      "New Article button not visible. Page state:",
      await page.content()
    );
  }

  await page.getByText("New Article").click();
  await page.getByRole("textbox", { name: "Article Title" }).fill("test title");
  await page
    .getByRole("textbox", { name: "What's this article about?" })
    .fill("about playwright");
  await page
    .getByRole("textbox", { name: "Write your article (in markdown)" })
    .fill("playwright");
  await page.getByRole("button", { name: "Publish Article" }).click();

  // intercept request
  const articleRes = await page.waitForResponse(
    "https://conduit-api.bondaracademy.com/api/articles/"
  );
  const articleResBody = await articleRes.json();
  const slugId = articleResBody.article.slug;

  await expect(page.locator(".article-page h1")).toContainText("test title");
  await page.getByText("Home").click();
  await page.getByText("Global Feed").click();
  await expect(page.locator("app-article-list h1").first()).toContainText(
    "test title"
  );

  const deleteRes = await request.delete(
    `https://conduit-api.bondaracademy.com/api/articles/${slugId}`
  );
  expect(deleteRes.status()).toBe(204);
});

test("delete article", async ({ page, request }) => {
  const articleRes = await request.post(
    "https://conduit-api.bondaracademy.com/api/articles/",
    {
      data: {
        article: {
          title: "test title 2",
          description: "playwright",
          body: "test body",
          tagList: [],
        },
      },
    }
  );

  if (articleRes.status() !== 201) {
    console.error("Failed to create article:", {
      status: articleRes.status(),
      response: await articleRes.text(),
    });
  }
  expect(articleRes.status()).toBe(201);

  await page.getByText("Global Feed").click();
  await page.waitForSelector("text=test title 2"); // Explicit wait
  await page.getByText("test title 2").click();
  await page.getByRole("button", { name: "Delete Article" }).first().click();
  await page.getByText(" Global Feed ").click();
  await expect(page.locator("app-article-list h1").first()).not.toContainText(
    "test title 2"
  );
});
