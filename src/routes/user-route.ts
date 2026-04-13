import { Elysia, t } from "elysia";
import { registerUser, loginUser, logoutUser } from "../service/user-service";
import { authPlugin } from "../plugins/auth-plugin";

export const userRoute = new Elysia({ prefix: "/api" })
  .use(authPlugin)
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
  .get("/users/current", async ({ user }) => {
    return { data: user };
  }, {
    auth: true
  })
  .delete("/users/logout", async ({ token }) => {
    try {
      await logoutUser(token);
      return { data: "OK" };
    } catch (error: any) {
      if (error.message === "unauthorized") {
        throw error; // Let the macro handle it if needed, but here it should already be validated
      }
      return { error: "Terjadi kesalahan pada server" };
    }
  }, {
    auth: true
  });
