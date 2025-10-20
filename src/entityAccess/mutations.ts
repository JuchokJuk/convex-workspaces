import { mutationGeneric } from "convex/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";
import { getMembership } from "../utils/queries/getMembership";
import { requireEntity } from "../utils/validation/requireEntity";
import { requireWorkspace } from "../utils/validation/requireWorkspace";
import { requirePermission } from "../utils/validation/requirePermission";
import { requireNotExists } from "../utils/validation/requireNotExists";

export const createEntityAccess = mutationGeneric({
  args: {
    workspaceId: v.id("workspaces"),
    entityId: v.id("entities"),
    accessLevel: v.union(v.literal("admin"), v.literal("editor"), v.literal("viewer")),
  },
  handler: async (ctx, args) => {
        const userId = getAuthUserId(ctx);

    const entity = await ctx.db.get(args.entityId);
    requireEntity(entity, args.entityId);

    const membership = await getMembership(ctx, entity.workspaceId, userId);
    requirePermission(membership && membership.userRole !== "viewer", "sharing entities");

    const targetWorkspace = await ctx.db.get(args.workspaceId);
    requireWorkspace(targetWorkspace, args.workspaceId);

    const existingAccess = await ctx.db
      .query("entityAccess")
      .withIndex("by_workspace_entity", (q) =>
        // @ts-expect-error double index typing missing
        q.eq("workspaceId", args.workspaceId).eq("entityId", args.entityId)
      )
      .first();

    requireNotExists(existingAccess, "Access");

    const accessId = await ctx.db.insert("entityAccess", {
      workspaceId: args.workspaceId,
      entityId: args.entityId,
      accessLevel: args.accessLevel,
    });

    return accessId;
  },
});

export const updateEntityAccessLevel = mutationGeneric({
  args: {
    accessId: v.id("entityAccess"),
    accessLevel: v.union(v.literal("admin"), v.literal("editor"), v.literal("viewer")),
  },
  handler: async (ctx, args) => {
        const userId = getAuthUserId(ctx);

    const access = await ctx.db.get(args.accessId);
    if (!access) throw new Error("Access not found");

    const entity = await ctx.db.get(access.entityId);
    requireEntity(entity, access.entityId);

    const membership = await getMembership(ctx, entity.workspaceId, userId);
    requirePermission(membership && membership.userRole !== "viewer", "updating entity access");

    await ctx.db.patch(args.accessId, {
      accessLevel: args.accessLevel,
    });
  },
});

export const removeEntityAccess = mutationGeneric({
  args: { accessId: v.id("entityAccess") },
  handler: async (ctx, args) => {
        const userId = getAuthUserId(ctx);

    const access = await ctx.db.get(args.accessId);
    if (!access) throw new Error("Access not found");

    const entity = await ctx.db.get(access.entityId);
    requireEntity(entity, access.entityId);

    const membership = await getMembership(ctx, entity.workspaceId, userId);
    requirePermission(membership && membership.userRole !== "viewer", "removing entity access");

    await ctx.db.delete(args.accessId);
  },
});