import {
  GenericDataModel,
  GenericQueryCtx,
  IdField,
  queryGeneric,
} from "convex/server";
import { v } from "convex/values";
import { getMembership } from "../../utils/queries/getMembership";
import { requireAuth } from "../../utils/validation/requireAuth";

export async function getEntitiesByWorkspaceHandler(
  ctx: GenericQueryCtx<GenericDataModel>,
  args: { workspaceId: IdField<"workspaces">["_id"] }
) {
  const userId = await requireAuth(ctx);

  const membership = await getMembership(ctx, args.workspaceId, userId);
  if (!membership) throw new Error("Access denied");

  return await ctx.db
    .query("entities")
    .withIndex("by_workspace", (q) => q.eq("workspaceId", args.workspaceId))
    .collect();
}

export const getEntitiesByWorkspace = queryGeneric({
  args: { workspaceId: v.id("workspaces") },
  handler: getEntitiesByWorkspaceHandler,
});
