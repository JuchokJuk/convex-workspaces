import { getAuthUserId } from "@convex-dev/auth/server";
import { ConvexError } from "convex/values";
import { QueryCtx, MutationCtx } from "../_generated/server";
import { Id } from "../_generated/dataModel";

/**
 * Получает текущего пользователя или выбрасывает ошибку
 */
export async function requireAuth(ctx: QueryCtx | MutationCtx): Promise<Id<"users">> {
  const userId = await getAuthUserId(ctx);
  if (!userId) {
    throw new ConvexError("Authentication required");
  }
  return userId as Id<"users">;
}


/**
 * Получает данные текущего пользователя из базы данных
 */
export async function getCurrentUser(ctx: QueryCtx | MutationCtx) {
  const userId = await requireAuth(ctx);
  const user = await ctx.db.get(userId);
  if (!user) {
    throw new ConvexError("User not found");
  }
  return user;
}

/**
 * Получает персональный воркспейс текущего пользователя
 */
export async function getCurrentUserPersonalWorkspace(ctx: QueryCtx | MutationCtx) {
  const userId = await requireAuth(ctx);
  const personalWorkspace = await ctx.db
    .query("workspaces")
    .withIndex("by_owner_personal", (q: any) =>
      q.eq("ownerId", userId).eq("personal", true)
    )
    .first();
  
  if (!personalWorkspace) {
    throw new ConvexError("Personal workspace not found");
  }
  
  return personalWorkspace;
}
