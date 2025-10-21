import { mutationGeneric } from "convex/server";
import { v } from "convex/values";
import type { GenericMutationCtx, GenericDataModel, IdField } from "convex/server";
import { getMembership } from "../../utils/queries/getMembership";
import { requirePermission } from "../../utils/validation/requirePermission";
import { requireWorkspace } from "../../utils/validation/requireWorkspace";
import { requireAuth } from "../../utils/validation/requireAuth";

export async function updateWorkspaceHandler(
  ctx: GenericMutationCtx<GenericDataModel>,
  args: {
    workspaceId: IdField<"workspaces">["_id"];
    name?: string;
  }
) {
  const userId = await requireAuth(ctx);

  const workspace = await ctx.db.get(args.workspaceId);
  requireWorkspace(workspace, args.workspaceId);

  const membership = await getMembership(ctx, args.workspaceId, userId);
  requirePermission(
    membership && membership.userRole === "admin",
    "updating workspace"
  );

  const { workspaceId, ...updates } = args;
  await ctx.db.patch(workspaceId, updates);
}

export const updateWorkspace = mutationGeneric({
  args: {
    workspaceId: v.id("workspaces"),
    name: v.optional(v.string()),
  },
  handler: updateWorkspaceHandler,
});
