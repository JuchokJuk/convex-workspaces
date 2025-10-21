import { IdField, mutationGeneric, queryGeneric } from "convex/server";
import { v } from "convex/values";
import { getMembership } from "../utils/queries/getMembership";
import { requirePermission } from "../utils/validation/requirePermission";
import { requireNotExists } from "../utils/validation/requireNotExists";
import { requireAuth } from "../utils/validation/requireAuth";

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
  handler: async (ctx, args) => {
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
  },
});

export const updateMembershipRole = mutationGeneric({
  args: {
    membershipId: v.id("memberships"),
    userRole: v.union(
      v.literal("admin"),
      v.literal("editor"),
      v.literal("viewer")
    ),
  },
  handler: async (ctx, args) => {
    const currentUserId = await requireAuth(ctx);

    const membership = await ctx.db.get(args.membershipId);
    if (!membership) throw new Error("Membership not found");

    const currentMembership = await getMembership(
      ctx,
      membership.workspaceId,
      currentUserId
    );
    requirePermission(
      currentMembership && currentMembership.userRole === "admin",
      "updating member role"
    );

    await ctx.db.patch(args.membershipId, {
      userRole: args.userRole,
    });
  },
});

export const removeMembership = mutationGeneric({
  args: { membershipId: v.id("memberships") },
  handler: async (ctx, args) => {
    const currentUserId = await requireAuth(ctx);

    const membership = await ctx.db.get(args.membershipId);
    if (!membership) throw new Error("Membership not found");

    const currentMembership = await getMembership(
      ctx,
      membership.workspaceId,
      currentUserId
    );
    requirePermission(
      currentMembership && currentMembership.userRole === "admin",
      "removing members"
    );

    await ctx.db.delete(args.membershipId);
  },
});

export const removeUserFromWorkspace = mutationGeneric({
  args: {
    workspaceId: v.id("workspaces"),
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
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
  },
});
