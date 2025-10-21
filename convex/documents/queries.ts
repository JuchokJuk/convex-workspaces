import { query } from "../_generated/server";
import { v } from "convex/values";
import { requireAuth } from "../utils/requireAuth";
import { Id } from "../_generated/dataModel";
import { UserRole } from "../../src";
import { workspaces } from "../workspaces";

export const getDocumentById = query({
  args: {
    documentId: v.id("documents"),
  },
  handler: async (ctx, args) => {
    await requireAuth(ctx);

    const document = await ctx.db.get(args.documentId);
    if (!document) return null;

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

    return document;
  },
});

export const getDocumentsByEntity = query({
  args: {
    entityId: v.id("entities"),
  },
  handler: async (ctx, args) => {
    await requireAuth(ctx);

    // Проверяем доступ к entity через convex-workspaces
    const entity = await ctx.db.get(args.entityId);
    if (!entity) throw new Error("Entity not found");

    const membership = await workspaces.getCurrentUserMembershipHandler(ctx, {
      workspaceId: entity.workspaceId,
    });
    if (!membership) {
      // Проверяем доступ через shared entity
      const effectiveAccess = await workspaces.getUserEffectiveAccessHandler(
        ctx,
        {
          entityId: args.entityId,
        }
      );
      if (!effectiveAccess) throw new Error("Access denied");
    }

    return await ctx.db
      .query("documents")
      .withIndex("by_entity", (q) => q.eq("entityId", args.entityId))
      .collect();
  },
});

export const getUserAccessibleDocuments = query({
  args: {},
  handler: async (ctx, args) => {
    await requireAuth(ctx);

    // Получаем все доступные entities через convex-workspaces
    const accessibleEntities =
      await workspaces.getUserAccessibleEntitiesHandler(ctx);

    const documents: {
      userRole: UserRole;
      workspaceId: Id<"workspaces">;
      _id: Id<"documents">;
      _creationTime: number;
      entityId: Id<"entities">;
      title: string;
    }[] = [];

    for (const entity of accessibleEntities) {
      const entityDocuments = await ctx.db
        .query("documents")
        .withIndex("by_entity", (q) => q.eq("entityId", entity._id))
        .collect();

      for (const document of entityDocuments) {
        documents.push({
          ...document,
          userRole: entity.userRole,
          workspaceId: entity.workspaceId,
        });
      }
    }

    return documents;
  },
});
