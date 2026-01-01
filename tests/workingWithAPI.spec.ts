import { test, expect } from "@playwright/test";
import tags from "../test-data/tags.json";
import { request } from "node:http";

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
  
  // await page.route('https://conduit-api.bondaracademy.com/api/articles?limit=10&offset=0', async (route) => {
  //   const res=await route.fetch();
  //   const resBody=await res.json();
  //   resBody.articles[0].title='This is a test title';
  //   resBody.articles[0].description='This is a test description';

  //   await route.fulfill({
  //     body: JSON.stringify(resBody),
  //   });
  // })
  await page.goto("https://conduit.bondaracademy.com/");
  await page.getByText('Sign in').click();
  await page.getByRole("textbox", { name: "Email" }).fill("test4@gmail.com");
  await page.getByRole("textbox", { name: "Password" }).fill("12345678");
  await page.getByRole("button").click();
});

test("has text", async ({ page }) => {
  await expect(page.locator(".navbar-brand")).toHaveText("conduit");
});

test("delete article", async ({ page, request }) => {
  const res = await request.post(
    "https://conduit-api.bondaracademy.com/api/users/login",
    {
      data: { user: { email: "test4@gmail.com", password: "12345678" } },
    }
  );
  const resBody = await res.json();
  const token = resBody.user.token;

  const articleRes = await request.post(
    "https://conduit-api.bondaracademy.com/api/articles/",
    {
      headers: { Authorization: `Token ${token}` },
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
  expect(articleRes.status()).toBe(201);

  await page.getByText("Global Feed").click();
  await page.getByText("test title 2").click();
  await page.getByRole("button", { name: "Delete Article" }).click();
  await page.getByText(" Global Feed ").click();
  await expect(page.locator("app-article-list h1").first()).not.toContainText(
    "test title 2"
  );
});
test("create article", async ({ page, request }) => {
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
  const res = await request.post(
    "https://conduit-api.bondaracademy.com/api/users/login",
    {
      data: { user: { email: "test4@gmail.com", password: "12345678" } },
    }
  );
  const resBody = await res.json();
  const token = resBody.user.token;

  const deleteRes=await request.delete(
    `https://conduit-api.bondaracademy.com/api/articles/${slugId}`,
    {
      headers: { Authorization: `Token ${token}` },
    }
  );
  expect(deleteRes.status()).toBe(204);
});
