import { queryGeneric } from "convex/server";
import { v } from "convex/values";
import type { GenericQueryCtx, GenericDataModel, IdField } from "convex/server";
import { requireAuth } from "../../utils/validation/requireAuth";

export async function getUserWorkspacesHandler(
  ctx: GenericQueryCtx<GenericDataModel>,
  args: {}
) {
  const userId = await requireAuth(ctx);

  const memberships = await ctx.db
    .query("memberships")
    .withIndex("by_user", (q) => q.eq("userId", userId))
    .collect();

  const workspaces = [];
  for (const membership of memberships) {
    const workspace = await ctx.db.get(membership.workspaceId as IdField<"workspaces">["_id"]);
    if (workspace) {
      workspaces.push({
        ...workspace,
        userRole: membership.userRole,
      });
    }
  }

  return workspaces;
}

export const getUserWorkspaces = queryGeneric({
  args: {},
  handler: getUserWorkspacesHandler,
});
