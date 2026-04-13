import { Elysia, t } from "elysia";
import { registerUser } from "../service/user-service";

export const userRoute = new Elysia({ prefix: "/api" })
  .post("/users", async ({ body, set }) => {
    try {
      const result = await registerUser(body);
      return result;
    } catch (error: any) {
      if (error.message === "email sudah terdaftar") {
        set.status = 400; // Or just 200 depending on requirements, but 400 is common for client error
        return { error: error.message };
      }
      set.status = 500;
      return { error: "Terjadi kesalahan pada server" };
    }
  }, {
    body: t.Object({
      name: t.String(),
      email: t.String(),
      password: t.String()
    })
  });
