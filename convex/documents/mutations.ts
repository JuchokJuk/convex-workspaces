import { mutation } from "../_generated/server";
import { v } from "convex/values";
import { api } from "../_generated/api";
import { requireAuth } from "../utils/requireAuth";
import { Id } from "../_generated/dataModel";

export const createDocument = mutation({
  args: {
    entityId: v.id("entities"),
    title: v.string(),
  },
  handler: async (ctx, args) => {
    await requireAuth(ctx);

    // Проверяем доступ к entity через convex-workspaces
    const entity = await ctx.db.get(args.entityId);
    if (!entity) throw new Error("Entity not found");

    const membership = await ctx.runQuery(
      api.workspaces.getCurrentUserMembership,
      {
        workspaceId: entity.workspaceId,
      }
    );
    if (!membership) throw new Error("Access denied");
    if (membership.userRole === "viewer") throw new Error("Insufficient permissions");

    return await ctx.db.insert("documents", {
      entityId: args.entityId,
      title: args.title,
    });
  },
});

export const updateDocument = mutation({
  args: {
    documentId: v.id("documents"),
    title: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await requireAuth(ctx);

    const document = await ctx.db.get(args.documentId);
    if (!document) throw new Error("Document not found");

    // Проверяем доступ к entity через convex-workspaces
    const entity = await ctx.db.get(document.entityId);
    if (!entity) throw new Error("Entity not found");

    const membership = await ctx.runQuery(
      api.workspaces.getCurrentUserMembership,
      {
        workspaceId: entity.workspaceId,
      }
    );
    if (!membership) throw new Error("Access denied");

    const { documentId, ...updates } = args;
    await ctx.db.patch(documentId, updates);
  },
});

export const removeDocument = mutation({
  args: {
    documentId: v.id("documents"),
  },
  handler: async (ctx, args) => {
    await requireAuth(ctx);

    const document = await ctx.db.get(args.documentId);
    if (!document) throw new Error("Document not found");

    // Проверяем доступ к entity через convex-workspaces
    const entity = await ctx.db.get(document.entityId);
    if (!entity) throw new Error("Entity not found");

    const membership = await ctx.runQuery(
      api.workspaces.getCurrentUserMembership,
      {
        workspaceId: entity.workspaceId,
      }
    );
    if (!membership) throw new Error("Access denied");

    await ctx.db.delete(args.documentId);
  },
});

export const shareDocument = mutation({
  args: {
    documentId: v.id("documents"),
    targetWorkspaceId: v.id("workspaces"),
    accessLevel: v.union(
      v.literal("admin"),
      v.literal("editor"),
      v.literal("viewer")
    ),
  },
  handler: async (ctx, args) => {
    await requireAuth(ctx);

    const document = await ctx.db.get(args.documentId);
    if (!document) throw new Error("Document not found");

    // // Проверяем доступ к исходному entity
    const entity = await ctx.db.get(document.entityId);
    if (!entity) throw new Error("Entity not found");

    const membership = await ctx.runQuery(
      api.workspaces.getCurrentUserMembership,
      {
        workspaceId: entity.workspaceId,
      }
    );
    if (!membership) throw new Error("Access denied");

    // Создаем entityAccess через convex-workspaces
    const result = (await ctx.runMutation(api.workspaces.createEntityAccess, {
      workspaceId: args.targetWorkspaceId,
      entityId: document.entityId,
      accessLevel: args.accessLevel,
    })) as Id<"entityAccess">;

    return result;
  },
});
