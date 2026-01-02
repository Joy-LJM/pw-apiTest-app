import { expect, test as setup } from "@playwright/test";

setup('create new article',async({request})=>{
  const articleRes= await request.post(
    "https://conduit-api.bondaracademy.com/api/articles/",{
      data: {
        article: {
          title: "likes test article",
          description: "playwright",
          body: "test body",
          tagList: [],
        },
      },
    }
  );
  expect(articleRes.status()).toEqual(201)
  const articleResBody = await articleRes.json();
  const slugId = articleResBody.article.slug;
  process.env['SLUG_ID'] = slugId;
})