import { Elysia } from "elysia";
import { db } from "./db";

const app = new Elysia()
  .get("/", () => "Hello Elysia from Bun!")
  .get("/users", async () => {
    try {
      const users = await db.query.users.findMany();
      return users;
    } catch (error) {
      return {
        message: "Database connection failed (check credentials in .env)",
        error: error instanceof Error ? error.message : String(error),
      };
    }
  })
  .listen(3000);

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
);
