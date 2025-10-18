import { mutation } from "../_generated/server";
import { v } from "convex/values";
import { internal } from "../_generated/api";
import { requireAuth } from "../utils/authUtils";

// Обновление пользователя
export const updateUser = mutation({
  args: {
    name: v.optional(v.string()),
    email: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await requireAuth(ctx);
    const user = await ctx.db.get(userId);
    if (!user) {
      throw new Error("User not found");
    }

    await ctx.db.patch(userId, {
      name: args.name,
      email: args.email,
    });
    return await ctx.db.get(userId);
  },
});

// Удаление пользователя
export const deleteUser = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await requireAuth(ctx);
    
    // Implement cascading deletion for user
    await ctx.scheduler.runAfter(0, internal.utils.cascadeDeletion.deleteUserCascade, {
      userId,
    });
    return { success: true };
  },
});

