import { mutationGeneric } from "convex/server";
import { v } from "convex/values";
import type { GenericMutationCtx, GenericDataModel, IdField } from "convex/server";
import { getMembership } from "../../utils/queries/getMembership";
import { requirePermission } from "../../utils/validation/requirePermission";
import { requireNotExists } from "../../utils/validation/requireNotExists";
import { requireAuth } from "../../utils/validation/requireAuth";

export async function createMembershipHandler(
  ctx: GenericMutationCtx<GenericDataModel>,
  args: {
    workspaceId: IdField<"workspaces">["_id"];
    userId: IdField<"users">["_id"];
    userRole: "admin" | "editor" | "viewer";
  }
) {
  const currentUserId = await requireAuth(ctx);

  const membership = await getMembership(
    ctx,
    args.workspaceId,
    currentUserId
  );
  requirePermission(
    membership && membership.userRole === "admin",
    "adding members"
  );

  const existingMembership = await getMembership(
    ctx,
    args.workspaceId,
    args.userId
  );
  requireNotExists(existingMembership, "Membership");

  const membershipId = await ctx.db.insert("memberships", {
    workspaceId: args.workspaceId,
    userId: args.userId,
    userRole: args.userRole,
  });

  return membershipId;
}

export const createMembership = mutationGeneric({
  args: {
    workspaceId: v.id("workspaces"),
    userId: v.id("users"),
    userRole: v.union(
      v.literal("admin"),
      v.literal("editor"),
      v.literal("viewer")
    ),
  },
  handler: createMembershipHandler,
});
