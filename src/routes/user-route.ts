import { Elysia, t } from "elysia";
import { registerUser, loginUser, getCurrentUser } from "../service/user-service";

export const userRoute = new Elysia({ prefix: "/api" })
  .post("/users", async ({ body, set }) => {
    try {
      const result = await registerUser(body);
      return result;
    } catch (error: any) {
      if (error.message === "email sudah terdaftar") {
        set.status = 400;
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
  })
  .post("/users/login", async ({ body, set }) => {
    try {
      const result = await loginUser(body);
      return result;
    } catch (error: any) {
      if (error.message === "email atau password salah") {
        set.status = 401; // Unauthorized
        return { error: error.message };
      }
      set.status = 500;
      return { error: "Terjadi kesalahan pada server" };
    }
  }, {
    body: t.Object({
      email: t.String(),
      password: t.String()
    })
  })
  .get("/users/current", async ({ headers, set }) => {
    try {
      const authorization = headers.authorization;
      if (!authorization || !authorization.startsWith("Bearer ")) {
        set.status = 401;
        return { error: "unauthorized" };
      }

      const token = authorization.replace("Bearer ", "");
      const result = await getCurrentUser(token);
      return { data: result };
    } catch (error: any) {
      if (error.message === "unauthorized") {
        set.status = 401;
        return { error: "unauthorized" };
      }
      set.status = 500;
      return { error: "Terjadi kesalahan pada server" };
    }
  });
