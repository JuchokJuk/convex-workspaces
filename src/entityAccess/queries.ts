import { queryGeneric } from "convex/server";
import { v } from "convex/values";
import { getEffectiveAccess } from "../utils/permissions/getEffectiveAccess";
import { requireAuth } from "../utils/validation/requireAuth";

export const getEntityAccessByEntityAndWorkspace = queryGeneric({
  args: {
    entityId: v.id("entities"),
    workspaceId: v.id("workspaces"),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("entityAccess")
      .withIndex("by_workspace_entity", (q) =>
        // @ts-expect-error double index typing missing
        q.eq("workspaceId", args.workspaceId).eq("entityId", args.entityId)
      )
      .first();
  },
});

export const getEntityAccessByEntity = queryGeneric({
  args: { entityId: v.id("entities") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("entityAccess")
      .withIndex("by_entity_workspace", (q) => q.eq("entityId", args.entityId))
      .collect();
  },
});

export const getEntityAccessByWorkspace = queryGeneric({
  args: { workspaceId: v.id("workspaces") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("entityAccess")
      .withIndex("by_workspace_entity", (q) =>
        q.eq("workspaceId", args.workspaceId)
      )
      .collect();
  },
});

export const getUserEffectiveAccess = queryGeneric({
  args: { entityId: v.id("entities") },
  returns: v.union(
    v.union(v.literal("admin"), v.literal("editor"), v.literal("viewer")),
    v.null()
  ),
  handler: async (ctx, args) => {
    const userId = await requireAuth(ctx);
    return await getEffectiveAccess(ctx, args.entityId, userId);
  },
});
