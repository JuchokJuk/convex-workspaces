import { mutationGeneric } from "convex/server";
import { v } from "convex/values";
import type { GenericMutationCtx, GenericDataModel, IdField } from "convex/server";
import { getMembership } from "../../utils/queries/getMembership";
import { requirePermission } from "../../utils/validation/requirePermission";
import { requireAuth } from "../../utils/validation/requireAuth";

export async function updateMembershipRoleHandler(
  ctx: GenericMutationCtx<GenericDataModel>,
  args: {
    membershipId: IdField<"memberships">["_id"];
    userRole: "admin" | "editor" | "viewer";
  }
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
    "updating member role"
  );

  await ctx.db.patch(args.membershipId, {
    userRole: args.userRole,
  });
}

export const updateMembershipRole = mutationGeneric({
  args: {
    membershipId: v.id("memberships"),
    userRole: v.union(
      v.literal("admin"),
      v.literal("editor"),
      v.literal("viewer")
    ),
  },
  handler: updateMembershipRoleHandler,
});
