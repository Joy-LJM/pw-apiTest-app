import { expect, test as setup } from "@playwright/test";
setup('delete article',async({request})=>{
    const deleteRes = await request.delete(
    `https://conduit-api.bondaracademy.com/api/articles/${process.env.SLUG_ID}`
  );
  expect(deleteRes.status()).toBe(204);
})