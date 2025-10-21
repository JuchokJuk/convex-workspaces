import { mutationGeneric } from "convex/server";
import { v } from "convex/values";
import type { GenericMutationCtx, GenericDataModel, IdField } from "convex/server";
import { getMembership } from "../../utils/queries/getMembership";
import { requirePermission } from "../../utils/validation/requirePermission";
import { requireAuth } from "../../utils/validation/requireAuth";

export async function removeMembershipHandler(
  ctx: GenericMutationCtx<GenericDataModel>,
  args: { membershipId: IdField<"memberships">["_id"] }
) {
  const currentUserId = await requireAuth(ctx);

  const membership = await ctx.db.get(args.membershipId);
  if (!membership) throw new Error("Membership not found");

  const currentMembership = await getMembership(
    ctx,
    membership.workspaceId as IdField<"workspaces">["_id"],
    currentUserId
  );
  requirePermission(
    currentMembership && currentMembership.userRole === "admin",
    "removing members"
  );

  await ctx.db.delete(args.membershipId);
}

export const removeMembership = mutationGeneric({
  args: { membershipId: v.id("memberships") },
  handler: removeMembershipHandler,
});
