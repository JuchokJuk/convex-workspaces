import { IdField, mutationGeneric } from "convex/server";
import { v } from "convex/values";
import type { GenericMutationCtx, GenericDataModel } from "convex/server";
import { getMembership } from "../../utils/queries/getMembership";
import { requirePermission } from "../../utils/validation/requirePermission";
import { requireAuth } from "../../utils/validation/requireAuth";

export async function removeUserFromWorkspaceHandler(
  ctx: GenericMutationCtx<GenericDataModel>,
  args: {
    workspaceId: IdField<"workspaces">["_id"];
    userId: IdField<"users">["_id"];
  }
) {
  const currentUserId = await requireAuth(ctx);

  const currentMembership = await getMembership(
    ctx,
    args.workspaceId,
    currentUserId
  );
  requirePermission(
    currentMembership && currentMembership.userRole === "admin",
    "removing users"
  );

  const membership = await getMembership(ctx, args.workspaceId, args.userId);
  if (!membership || !membership._id) throw new Error("Membership not found");

  await ctx.db.delete(membership._id as IdField<"memberships">["_id"]);
}

export const removeUserFromWorkspace = mutationGeneric({
  args: {
    workspaceId: v.id("workspaces"),
    userId: v.id("users"),
  },
  handler: removeUserFromWorkspaceHandler,
});
