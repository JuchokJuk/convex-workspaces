import { mutation } from "../_generated/server";
import { v } from "convex/values";
import { requireAuth } from "../utils/requireAuth";
import { Id } from "../_generated/dataModel";
import { workspaces } from "../workspaces";
import { checkEntityAccess, checkWritePermission } from "../utils/accessControl";

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
    await checkEntityAccess(ctx, document.entityId);

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
    await checkEntityAccess(ctx, document.entityId);

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

    // Проверяем доступ к исходному entity
    await checkEntityAccess(ctx, document.entityId);

    // Создаем entityAccess через convex-workspaces
    const result = (await workspaces.createEntityAccessHandler(ctx, {
      workspaceId: args.targetWorkspaceId,
      entityId: document.entityId,
      accessLevel: args.accessLevel,
    })) as Id<"entityAccess">;

    return result;
  },
});

export const createDocument = mutation({
  args: {
    workspaceId: v.id("workspaces"),
    title: v.string(),
  },
  handler: async (ctx, args) => {
    await requireAuth(ctx);

    // Создаем entity в воркспейсе
    const entityId = (await workspaces.createEntityHandler(ctx, {
      workspaceId: args.workspaceId,
    })) as Id<"entities">;

    // Создаем документ
    const documentId = await ctx.db.insert("documents", {
      entityId,
      title: args.title,
    });

    return { entityId, documentId };
  },
});

export const createDocumentForEntity = mutation({
  args: {
    entityId: v.id("entities"),
    title: v.string(),
  },
  handler: async (ctx, args) => {
    await requireAuth(ctx);

    // Проверяем доступ к entity через convex-workspaces
    const { membership } = await checkEntityAccess(ctx, args.entityId);
    checkWritePermission(membership);

    // Создаем документ
    const documentId = await ctx.db.insert("documents", {
      entityId: args.entityId,
      title: args.title,
    });

    return documentId;
  },
});

export const shareDocumentWithUser = mutation({
  args: {
    documentId: v.id("documents"),
    targetUserId: v.id("users"),
    accessLevel: v.union(
      v.literal("admin"),
      v.literal("editor"),
      v.literal("viewer")
    ),
  },
  handler: async (ctx, args) => {
    await requireAuth(ctx);

    // Получаем документ
    const document = await ctx.db.get(args.documentId);
    if (!document) throw new Error("Document not found");

    // Проверяем доступ к entity через convex-workspaces
    await checkEntityAccess(ctx, document.entityId);

    // Получаем персональный воркспейс целевого пользователя
    const personalWorkspace =
      await workspaces.getPersonalWorkspaceByUserIdHandler(ctx, {
        userId: args.targetUserId,
      });

    if (!personalWorkspace) throw new Error("Personal workspace not found");

    // Создаем entityAccess через convex-workspaces
    const result = (await workspaces.createEntityAccessHandler(ctx, {
      workspaceId: personalWorkspace._id,
      entityId: document.entityId,
      accessLevel: args.accessLevel,
    })) as Id<"entityAccess">;

    return result;
  },
});
