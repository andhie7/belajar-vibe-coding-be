import { Elysia, t } from "elysia";
import { registerUser, loginUser, logoutUser } from "../service/user-service";
import { authPlugin } from "../plugins/auth-plugin";

export const userRoute = new Elysia({ prefix: "/api/users" })
  .use(authPlugin)
  .post("/", async ({ body, set }) => {
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
      name: t.String({ maxLength: 255, error: "name tidak boleh lebih dari 255 karakter" }),
      email: t.String({ maxLength: 255, error: "email tidak boleh lebih dari 255 karakter" }),
      password: t.String({ maxLength: 255, error: "password tidak boleh lebih dari 255 karakter" })
    })
  })
  .post("/login", async ({ body, set }) => {
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
      email: t.String({ maxLength: 255, error: "email tidak boleh lebih dari 255 karakter" }),
      password: t.String({ maxLength: 255, error: "password tidak boleh lebih dari 255 karakter" })
    })
  })
  .get("/current", async ({ user }) => {
    return { data: user };
  }, {
    auth: true
  })
  .delete("/logout", async ({ token }) => {
    try {
      await logoutUser(token);
      return { data: "OK" };
    } catch (error: any) {
      if (error.message === "unauthorized") {
        throw error;
      }
      return { error: "Terjadi kesalahan pada server" };
    }
  }, {
    auth: true
  });
