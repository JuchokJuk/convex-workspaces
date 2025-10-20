import { queryGeneric } from "convex/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";
import { getMembership } from "../utils/queries/getMembership";
import { getEntityAccess } from "../utils/queries/getEntityAccess";
import { getEffectiveAccess } from "../utils/permissions/getEffectiveAccess";

export const getEntityById = queryGeneric({
  args: { entityId: v.id("entities") },
  handler: async (ctx, args) => {
        const userId = getAuthUserId(ctx);

    const entity = await ctx.db.get(args.entityId);
    if (!entity) return null;

    const membership = await getMembership(ctx, entity.workspaceId, userId);
    if (!membership) {
      const entityAccess = await getEntityAccess(ctx, args.entityId);
      const hasAccess = entityAccess.some((access: any) => 
        getMembership(ctx, access.workspaceId, userId)
      );
      if (!hasAccess) throw new Error("Access denied");
    }

    return entity;
  },
});

export const getEntitiesByWorkspace = queryGeneric({
  args: { workspaceId: v.id("workspaces") },
  handler: async (ctx, args) => {
        const userId = getAuthUserId(ctx);

    const membership = await getMembership(ctx, args.workspaceId, userId);
    if (!membership) throw new Error("Access denied");

    return await ctx.db
      .query("entities")
      .withIndex("by_workspace", (q) => q.eq("workspaceId", args.workspaceId))
      .collect();
  },
});

export const checkEntityAccess = queryGeneric({
  args: {
    entityId: v.id("entities"),
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    const entity = await ctx.db.get(args.entityId);
    if (!entity) return false;

    const membership = await getMembership(ctx, entity.workspaceId, args.userId);
    if (membership) return true;

    const entityAccess = await getEntityAccess(ctx, args.entityId);
    for (const access of entityAccess) {
      const userMembership = await getMembership(ctx, access.workspaceId as any, args.userId);
      if (userMembership) return true;
    }

    return false;
  },
});

export const getUserAccessibleEntities = queryGeneric({
  args: {},
  handler: async (ctx, args) => {
        const userId = getAuthUserId(ctx);

    const memberships = await ctx.db
      .query("memberships")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();

    const accessibleEntities = [];

    for (const membership of memberships) {
      const entities = await ctx.db
        .query("entities")
        .withIndex("by_workspace", (q) => q.eq("workspaceId", membership.workspaceId))
        .collect();

      for (const entity of entities) {
        accessibleEntities.push({
          ...entity,
          userRole: membership.userRole,
          workspaceId: membership.workspaceId,
        });
      }
    }

    const allEntityAccess = await ctx.db
      .query("entityAccess")
      .collect();

    for (const access of allEntityAccess) {
      const userMembership = await getMembership(ctx, access.workspaceId, userId);
      if (userMembership) {
        const entity = await ctx.db.get(access.entityId);
        if (entity && !accessibleEntities.find(e => e._id === entity._id)) {
          accessibleEntities.push({
            ...entity,
            userRole: access.accessLevel,
            workspaceId: access.workspaceId,
          });
        }
      }
    }

    return accessibleEntities;
  },
});