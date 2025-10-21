import { queryGeneric } from "convex/server";
import { v } from "convex/values";
import { getMembership } from "../utils/queries/getMembership";
import { getEntityAccess } from "../utils/queries/getEntityAccess";
import { requireAuth } from "../utils/validation/requireAuth";
import { getEffectiveAccess } from "../utils/permissions/getEffectiveAccess";

export const getEntityById = queryGeneric({
  args: { entityId: v.id("entities") },
  handler: async (ctx, args) => {
    const userId = await requireAuth(ctx);

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
    const userId = await requireAuth(ctx);

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
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const currentUserId = await requireAuth(ctx);
    
    const entity = await ctx.db.get(args.entityId);
    if (!entity) return false;

    // Проверяем, что текущий пользователь имеет доступ к entity
    // Либо через членство в оригинальном воркспейсе, либо через shared access
    const currentUserMembership = await getMembership(ctx, entity.workspaceId, currentUserId);
    if (!currentUserMembership) {
      // Проверяем shared access
      const entityAccess = await getEntityAccess(ctx, args.entityId);
      let hasSharedAccess = false;
      
      for (const access of entityAccess) {
        const membership = await getMembership(ctx, access.workspaceId as any, currentUserId);
        if (membership) {
          hasSharedAccess = true;
          break;
        }
      }
      
      if (!hasSharedAccess) {
        throw new Error("Access denied - you are not a member of this workspace");
      }
    }

    // Теперь безопасно проверяем доступ target пользователя
    const membership = await getMembership(
      ctx,
      entity.workspaceId,
      args.userId
    );
    if (membership) return true;

    const entityAccess = await getEntityAccess(ctx, args.entityId);
    for (const access of entityAccess) {
      const userMembership = await getMembership(
        ctx,
        access.workspaceId as any,
        args.userId
      );
      if (userMembership) return true;
    }

    return false;
  },
});

export const getUserAccessibleEntities = queryGeneric({
  args: {},
  returns: v.array(
    v.object({
      _id: v.id("entities"),
      _creationTime: v.number(),
      workspaceId: v.id("workspaces"),
      userRole: v.union(
        v.literal("admin"),
        v.literal("editor"),
        v.literal("viewer")
      ),
    })
  ),
  handler: async (ctx, args) => {
    const userId = await requireAuth(ctx);

    const memberships = await ctx.db
      .query("memberships")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();

    const accessibleEntities = [];

    for (const membership of memberships) {
      const entities = await ctx.db
        .query("entities")
        .withIndex("by_workspace", (q) =>
          q.eq("workspaceId", membership.workspaceId)
        )
        .collect();

      for (const entity of entities) {
        accessibleEntities.push({
          ...entity,
          userRole: membership.userRole,
          workspaceId: membership.workspaceId,
        });
      }
    }

    const allEntityAccess = await ctx.db.query("entityAccess").collect();

    for (const access of allEntityAccess) {
      const userMembership = await getMembership(
        ctx,
        access.workspaceId,
        userId
      );
      if (userMembership) {
        const entity = await ctx.db.get(access.entityId);
        if (entity && !accessibleEntities.find((e) => e._id === entity._id)) {
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
