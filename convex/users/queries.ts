import { query } from "../_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

// Получение текущего пользователя
export const getCurrentUserQuery = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return null;
    }
    return await ctx.db.get(userId);
  },
});

// Получение всех пользователей (для тестов)
export const getAllUsers = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("users").collect();
  },
});

