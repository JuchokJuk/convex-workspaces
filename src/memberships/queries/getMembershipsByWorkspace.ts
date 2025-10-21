import { queryGeneric } from "convex/server";
import { v } from "convex/values";
import type { GenericQueryCtx, GenericDataModel, IdField } from "convex/server";
import { getMembership } from "../../utils/queries/getMembership";
import { requireAuth } from "../../utils/validation/requireAuth";

export async function getMembershipsByWorkspaceHandler(
  ctx: GenericQueryCtx<GenericDataModel>,
  args: { workspaceId: IdField<"workspaces">["_id"] }
) {
  const userId = await requireAuth(ctx);

  const membership = await getMembership(ctx, args.workspaceId, userId);
  if (!membership) throw new Error("Access denied");

  return await ctx.db
    .query("memberships")
    .withIndex("by_workspace_user", (q) =>
      q.eq("workspaceId", args.workspaceId)
    )
    .collect();
}

export const getMembershipsByWorkspace = queryGeneric({
  args: { workspaceId: v.id("workspaces") },
  handler: getMembershipsByWorkspaceHandler,
});
