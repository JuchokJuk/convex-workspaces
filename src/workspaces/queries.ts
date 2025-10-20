import { queryGeneric } from "convex/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";
import { getMembership } from "../utils/queries/getMembership";

export const getWorkspaceById = queryGeneric({
  args: { workspaceId: v.id("workspaces") },
  handler: async (ctx, args) => {
        const userId = getAuthUserId(ctx);

    const workspace = await ctx.db.get(args.workspaceId);
    if (!workspace) return null;

    const membership = await getMembership(ctx, args.workspaceId, userId);
    if (!membership) throw new Error("Access denied");

    return { ...workspace, userRole: membership.userRole };
  },
});

export const getWorkspacesByOwner = queryGeneric({
  args: {},
  handler: async (ctx, args) => {
        const userId = getAuthUserId(ctx);

    return await ctx.db
      .query("workspaces")
      .withIndex("by_owner", (q) => q.eq("ownerId", userId))
      .collect();
  },
});

export const getPersonalWorkspace = queryGeneric({
  args: {},
  handler: async (ctx, args) => {
        const userId = getAuthUserId(ctx);

    return await ctx.db
      .query("workspaces")
      .withIndex("by_owner_personal", (q) =>
        // @ts-expect-error double index typing missing
        q.eq("ownerId", userId).eq("personal", true)
      )
      .first();
  },
});

export const getUserWorkspaces = queryGeneric({
  args: {},
  handler: async (ctx, args) => {
        const userId = getAuthUserId(ctx);

    const memberships = await ctx.db
      .query("memberships")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();

    const workspaces = [];
    for (const membership of memberships) {
      const workspace = await ctx.db.get(membership.workspaceId);
      if (workspace) {
        workspaces.push({
          ...workspace,
          userRole: membership.userRole,
        });
      }
    }

    return workspaces;
  },
});