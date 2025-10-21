import type { GenericDataModel, GenericQueryCtx, IdField } from "convex/server";

export async function getMembership(
  ctx: GenericQueryCtx<GenericDataModel>,
  workspaceId: IdField<"workspaces">["_id"],
  userId: IdField<"users">["_id"]
) {
  return await ctx.db
    .query("memberships")
    .withIndex("by_workspace_user", (q) =>
      // @ts-expect-error double index typing missing
      q.eq("workspaceId", workspaceId).eq("userId", userId)
    )
    .first();
}
