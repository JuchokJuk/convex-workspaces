import { query } from "../_generated/server";
import { v } from "convex/values";
import { requireAuth } from "../utils/requireAuth";
import { Id } from "../_generated/dataModel";
import { UserRole } from "../../src";
import { workspaces } from "../workspaces";
import { checkEntityAccess } from "../utils/accessControl";

export const getDocumentById = query({
  args: {
    documentId: v.id("documents"),
  },
  handler: async (ctx, args) => {
    await requireAuth(ctx);

    const document = await ctx.db.get(args.documentId);
    if (!document) return null;

    // Проверяем доступ к entity через convex-workspaces
    await checkEntityAccess(ctx, document.entityId);

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
    await checkEntityAccess(ctx, args.entityId);

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
    const accessibleEntities = await workspaces.getUserAccessibleEntitiesHandler(ctx);

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
