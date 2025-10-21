import { queryGeneric } from "convex/server";
import { v } from "convex/values";
import type { GenericQueryCtx, GenericDataModel, IdField } from "convex/server";

export async function getEntityAccessByEntityAndWorkspaceHandler(
  ctx: GenericQueryCtx<GenericDataModel>,
  args: {
    entityId: IdField<"entities">["_id"];
    workspaceId: IdField<"workspaces">["_id"];
  }
) {
  return await ctx.db
    .query("entityAccess")
    .withIndex("by_workspace_entity", (q) =>
      // @ts-expect-error double index typing missing
      q.eq("workspaceId", args.workspaceId).eq("entityId", args.entityId)
    )
    .first();
}

export const getEntityAccessByEntityAndWorkspace = queryGeneric({
  args: {
    entityId: v.id("entities"),
    workspaceId: v.id("workspaces"),
  },
  handler: getEntityAccessByEntityAndWorkspaceHandler,
});
