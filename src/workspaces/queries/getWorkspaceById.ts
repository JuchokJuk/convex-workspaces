import { queryGeneric } from "convex/server";
import { v } from "convex/values";
import type { GenericQueryCtx, GenericDataModel, IdField } from "convex/server";
import { getMembership } from "../../utils/queries/getMembership";
import { requireAuth } from "../../utils/validation/requireAuth";

export async function getWorkspaceByIdHandler(
  ctx: GenericQueryCtx<GenericDataModel>,
  args: { workspaceId: IdField<"workspaces">["_id"] }
) {
  const userId = await requireAuth(ctx);

  const workspace = await ctx.db.get(args.workspaceId);
  if (!workspace) return null;

  const membership = await getMembership(ctx, args.workspaceId, userId);
  if (!membership) throw new Error("Access denied");

  return { ...workspace, userRole: membership.userRole };
}

export const getWorkspaceById = queryGeneric({
  args: { workspaceId: v.id("workspaces") },
  handler: getWorkspaceByIdHandler,
});
