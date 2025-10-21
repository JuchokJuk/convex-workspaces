import { queryGeneric } from "convex/server";
import { v } from "convex/values";
import type { GenericQueryCtx, GenericDataModel } from "convex/server";
import { requireAuth } from "../../utils/validation/requireAuth";

export async function getWorkspacesByOwnerHandler(
  ctx: GenericQueryCtx<GenericDataModel>,
  args: {}
) {
  const userId = await requireAuth(ctx);

  return await ctx.db
    .query("workspaces")
    .withIndex("by_owner", (q) => q.eq("ownerId", userId))
    .collect();
}

export const getWorkspacesByOwner = queryGeneric({
  args: {},
  handler: getWorkspacesByOwnerHandler,
});
