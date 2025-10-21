import { mutation } from "../_generated/server";
import { v } from "convex/values";
import { requireAuth } from "../utils/requireAuth";
import { Doc, Id } from "../_generated/dataModel";
import { workspaces } from "../workspaces";

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

    const membership = await workspaces.getCurrentUserMembershipHandler(ctx, {
      workspaceId: entity.workspaceId,
    });
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

    const membership = await workspaces.getCurrentUserMembershipHandler(ctx, {
      workspaceId: entity.workspaceId,
    });
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

    const membership = await workspaces.getCurrentUserMembershipHandler(ctx, {
      workspaceId: entity.workspaceId,
    });
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

    const membership = await workspaces.getCurrentUserMembershipHandler(ctx, {
      workspaceId: entity.workspaceId,
    });
    if (!membership) throw new Error("Access denied");

    // Создаем entityAccess через convex-workspaces
    const result = (await workspaces.createEntityAccessHandler(ctx, {
      workspaceId: args.targetWorkspaceId,
      entityId: document.entityId,
      accessLevel: args.accessLevel,
    })) as Id<"entityAccess">;

    return result;
  },
});

export const createDocumentWithEntity = mutation({
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

    // Создаем документ напрямую (инлайн из createDocument)
    // Проверяем доступ к entity через convex-workspaces
    const entity = await ctx.db.get(entityId);
    if (!entity) throw new Error("Entity not found");

    const membership = await workspaces.getCurrentUserMembershipHandler(ctx, {
      workspaceId: entity.workspaceId,
    });
    if (!membership) throw new Error("Access denied");
    if (membership.userRole === "viewer")
      throw new Error("Insufficient permissions");

    const documentId = await ctx.db.insert("documents", {
      entityId,
      title: args.title,
    });

    return { entityId, documentId };
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

    // Получаем документ напрямую (инлайн из getDocumentById)
    const document = await ctx.db.get(args.documentId);
    if (!document) throw new Error("Document not found");

    // Проверяем доступ к entity через convex-workspaces
    const entity = await ctx.db.get(document.entityId);
    if (!entity) throw new Error("Entity not found");

    const membership = await workspaces.getCurrentUserMembershipHandler(ctx, {
      workspaceId: entity.workspaceId,
    });
    if (!membership) {
      // Проверяем доступ через shared entity
      const effectiveAccess = await workspaces.getUserEffectiveAccessHandler(
        ctx,
        {
          entityId: document.entityId,
        }
      );
      if (!effectiveAccess) throw new Error("Access denied");
    }

    // Получаем персональный воркспейс целевого пользователя
    const personalWorkspace = (await workspaces.getPersonalWorkspaceHandler(
      ctx,
      {}
    )) as Doc<"workspaces"> | null;

    if (!personalWorkspace) throw new Error("Personal workspace not found");

    // Шерим документ напрямую (инлайн из shareDocument)
    // Проверяем доступ к исходному entity (дублирующаяся проверка убрана)
    if (!membership) throw new Error("Access denied");

    // Создаем entityAccess через convex-workspaces
    const result = (await workspaces.createEntityAccessHandler(ctx, {
      workspaceId: personalWorkspace._id,
      entityId: document.entityId,
      accessLevel: args.accessLevel,
    })) as Id<"entityAccess">;

    return result;
  },
});