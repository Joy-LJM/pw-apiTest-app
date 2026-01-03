import { request, expect } from "@playwright/test";
import fs from "fs";
import user from "./.auth/user.json";
interface Origin {
  origin: string;
  localStorage: { name: string; value: string }[];
}
const typedUser = user as { origins: Origin[] };

async function globalSetup() {
  const context = await request.newContext();

  const res = await context.post(
    "https://conduit-api.bondaracademy.com/api/users/login",
    {
      data: { user: { email: "test4@gmail.com", password: "12345678" } },
    }
  );
  const resBody = await res.json();
  const token = resBody.user.token;

  console.log("Authorization Token:", token); // Debugging token

  // Ensure origins array is properly initialized
  if (!typedUser.origins || typedUser.origins.length === 0) {
    typedUser.origins = [
      {
        origin: "https://conduit.bondaracademy.com",
        localStorage: [],
      },
    ];
  }

  // Update localStorage with the token
  typedUser.origins[0].localStorage = [
    {
      name: "jwt",
      value: token,
    },
  ];

  // Save updated user.json
  fs.writeFileSync(".auth/user.json", JSON.stringify(typedUser, null, 2));
  process.env["ACCESS_TOKEN"] = token;

  const articleRes = await context.post(
    "https://conduit-api.bondaracademy.com/api/articles/",
    {
      headers: { Authorization: `Token ${token}` }, // Include Authorization header
      data: {
        article: {
          title: "global likes test article",
          description: "playwright",
          body: "test body",
          tagList: [],
        },
      },
    }
  );

  console.error("Article creation response:", await articleRes.text()); // Log response for debugging

  if (articleRes.status() !== 201) {
    console.error("Failed to create article:", await articleRes.text()); // Log error response
  }
  expect(articleRes.status()).toEqual(201);

  const articleResBody = await articleRes.json();
  const slugId = articleResBody.article.slug;
  process.env["SLUG_ID"] = slugId;
}
export default globalSetup;
