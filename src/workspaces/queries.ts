import { queryGeneric } from "convex/server";
import { v } from "convex/values";
import { requireAuth } from "../utils/authUtils";
import { requirePersonalWorkspace } from "../utils/requirePersonalWorkspace";

export const getPersonalWorkspace = queryGeneric({
  args: {},
  handler: async (ctx: any) => {
    const userId = await requireAuth(ctx);

    return await requirePersonalWorkspace(ctx, userId as any);
  },
});

export const getUserWorkspaces = queryGeneric({
  args: {},
  handler: async (ctx: any) => {
    const userId = await requireAuth(ctx);
    
    const workspaceUsers = await ctx.db
      .query("workspaceUsers")
      .withIndex("by_user", (q: any) => q.eq("userId", userId))
      .collect();

    const workspaces = await Promise.all(
      workspaceUsers.map(async (wu: any) => {
        const workspace = await ctx.db.get(wu.workspaceId);
        return workspace ? { ...workspace, userRole: wu.userRole } : null;
      })
    );

    return workspaces.filter(Boolean);
  },
});

export const getWorkspace = queryGeneric({
  args: { workspaceId: v.id("workspaces") },
  handler: async (ctx: any, args: any) => {
    const userId = await requireAuth(ctx);
    return await ctx.db.get(args.workspaceId);
  },
});

export const getWorkspaceRole = queryGeneric({
  args: { workspaceId: v.id("workspaces") },
  handler: async (ctx: any, args: any) => {
    const userId = await requireAuth(ctx);

    const workspaceUser = await ctx.db
      .query("workspaceUsers")
      .withIndex("by_workspace_user", (q: any) =>
        q.eq("workspaceId", args.workspaceId).eq("userId", userId)
      )
      .first();

    return workspaceUser?.userRole || null;
  },
});
