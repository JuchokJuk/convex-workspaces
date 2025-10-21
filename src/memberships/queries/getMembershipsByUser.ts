import { queryGeneric } from "convex/server";
import { v } from "convex/values";
import type { GenericQueryCtx, GenericDataModel } from "convex/server";
import { requireAuth } from "../../utils/validation/requireAuth";

export async function getMembershipsByUserHandler(
  ctx: GenericQueryCtx<GenericDataModel>,
  args: {}
) {
  const userId = await requireAuth(ctx);

  return await ctx.db
    .query("memberships")
    .withIndex("by_user", (q) => q.eq("userId", userId))
    .collect();
}

export const getMembershipsByUser = queryGeneric({
  args: {},
  handler: getMembershipsByUserHandler,
});
