import { test as setup } from "@playwright/test";
import user from '../.auth/user.json';

// Define the correct type for user.origins
interface Origin {
  origin: string;
  localStorage: { name: string; value: string }[];
}

// Ensure user.origins is typed correctly
const typedUser = user as { origins: Origin[] };
import fs from 'fs';

setup("authenticate and save storage state", async ({ page, request }) => {
  const res = await request.post(
    "https://conduit-api.bondaracademy.com/api/users/login",
    {
      data: { user: { email: "test4@gmail.com", password: "12345678" } },
    }
  );
  const resBody = await res.json();
  const token = resBody.user.token;

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
  process.env['ACCESS_TOKEN']=token;
});
