import { queryGeneric } from "convex/server";
import { v } from "convex/values";
import type { GenericQueryCtx, GenericDataModel, IdField } from "convex/server";

export async function getEntityAccessByWorkspaceHandler(
  ctx: GenericQueryCtx<GenericDataModel>,
  args: { workspaceId: IdField<"workspaces">["_id"] }
) {
  return await ctx.db
    .query("entityAccess")
    .withIndex("by_workspace_entity", (q) =>
      q.eq("workspaceId", args.workspaceId)
    )
    .collect();
}

export const getEntityAccessByWorkspace = queryGeneric({
  args: { workspaceId: v.id("workspaces") },
  handler: getEntityAccessByWorkspaceHandler,
});
