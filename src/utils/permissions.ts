import { queryGeneric } from "convex/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";
import { checkWorkspaceAccess } from "./permissions/checkWorkspaceAccess";
import { getEffectiveAccess } from "./permissions/getEffectiveAccess";
import { UserRole, ROLE_HIERARCHY } from "./types/roles";

export const checkUserPermission = queryGeneric({
  args: {
    workspaceId: v.id("workspaces"),
    requiredRole: v.union(v.literal("admin"), v.literal("editor"), v.literal("viewer")),
  },
  handler: async (ctx, args) => {
        const userId = getAuthUserId(ctx);
    return await checkWorkspaceAccess(ctx, args.workspaceId, userId, args.requiredRole as UserRole);
  },
});

export const checkEntityPermission = queryGeneric({
  args: {
    entityId: v.id("entities"),
    requiredRole: v.union(v.literal("admin"), v.literal("editor"), v.literal("viewer")),
  },
  handler: async (ctx, args) => {
        const userId = getAuthUserId(ctx);
    const effectiveRole = await getEffectiveAccess(ctx, args.entityId, userId);
    if (!effectiveRole) return false;

    return ROLE_HIERARCHY[effectiveRole] >= ROLE_HIERARCHY[args.requiredRole as UserRole];
  },
});

export const getUserRoleInWorkspace = queryGeneric({
  args: { workspaceId: v.id("workspaces") },
  handler: async (ctx, args) => {
        const userId = getAuthUserId(ctx);
    const membership = await ctx.db
      .query("memberships")
      .withIndex("by_workspace_user", (q) =>
        // @ts-expect-error double index typing missing
        q.eq("workspaceId", args.workspaceId).eq("userId", userId)
      )
      .first();

    return membership?.userRole as UserRole || null;
  },
});

export const getUserRoleForEntity = queryGeneric({
  args: { entityId: v.id("entities") },
  handler: async (ctx, args) => {
        const userId = getAuthUserId(ctx);
    return await getEffectiveAccess(ctx, args.entityId, userId);
  },
});