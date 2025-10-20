import type { GenericDataModel, GenericQueryCtx } from "convex/server";

export async function getMembership(
  ctx: GenericQueryCtx<GenericDataModel>,
  workspaceId: string,
  userId: any
) {
  return await ctx.db
    .query("memberships")
    .withIndex("by_workspace_user", (q) =>
      // @ts-expect-error double index typing missing
      q.eq("workspaceId", workspaceId).eq("userId", userId)
    )
    .first();
}
