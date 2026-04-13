import { Elysia, status } from "elysia";
import { getCurrentUser } from "../service/user-service";

export const authPlugin = new Elysia({ name: "auth-plugin" })
  .macro({
    auth: (enabled: boolean) => ({
      resolve: async ({ headers }) => {
        if (!enabled) return;

        const authorization = headers.authorization;
        if (!authorization || !authorization.startsWith("Bearer ")) {
          return status(401, { error: "unauthorized" });
        }

        const token = authorization.substring("Bearer ".length);
        try {
          const user = await getCurrentUser(token);
          return { user, token };
        } catch (e) {
          return status(401, { error: "unauthorized" });
        }
      }
    })
  });
