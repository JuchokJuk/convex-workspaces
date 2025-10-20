import { queryGeneric } from "convex/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";
import { getMembership } from "../utils/queries/getMembership";

export const getMembershipByWorkspaceAndUser = queryGeneric({
  args: {
    workspaceId: v.id("workspaces"),
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    return await getMembership(ctx, args.workspaceId, args.userId);
  },
});

export const getMembershipsByWorkspace = queryGeneric({
  args: { workspaceId: v.id("workspaces") },
  handler: async (ctx, args) => {
        const userId = getAuthUserId(ctx);

    const membership = await getMembership(ctx, args.workspaceId, userId);
    if (!membership) throw new Error("Access denied");

    return await ctx.db
      .query("memberships")
      .withIndex("by_workspace_user", (q) => q.eq("workspaceId", args.workspaceId))
      .collect();
  },
});

export const getMembershipsByUser = queryGeneric({
  args: {},
  handler: async (ctx, args) => {
        const userId = getAuthUserId(ctx);

    return await ctx.db
      .query("memberships")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();
  },
});

export const getCurrentUserMembership = queryGeneric({
  args: { workspaceId: v.id("workspaces") },
  handler: async (ctx, args) => {
        const userId = getAuthUserId(ctx);

    return await getMembership(ctx, args.workspaceId, userId);
  },
});