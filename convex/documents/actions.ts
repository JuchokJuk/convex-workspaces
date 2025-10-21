import { v } from "convex/values";
import { action } from "../_generated/server";
import { api } from "../_generated/api";
import { requireAuth } from "../utils/requireAuth";
import { Id, Doc } from "../_generated/dataModel";

export const createDocumentWithEntity = action({
  args: {
    workspaceId: v.id("workspaces"),
    title: v.string(),
  },
  handler: async (ctx, args) => {
    await requireAuth(ctx);

    // Создаем entity в воркспейсе
    const entityId = (await ctx.runMutation(api.workspaces.createEntity, {
      workspaceId: args.workspaceId,
    })) as Id<"entities">;

    // Создаем документ
    const documentId = (await ctx.runMutation(
      api.documents.mutations.createDocument,
      {
        entityId,
        title: args.title,
      }
    )) as Id<"documents">;

    return { entityId, documentId };
  },
});

export const shareDocumentWithUser = action({
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
    const document = await ctx.runQuery(api.documents.queries.getDocumentById, {
      documentId: args.documentId,
    });
    if (!document) throw new Error("Document not found");

    // Получаем персональный воркспейс целевого пользователя
    const personalWorkspace = (await ctx.runQuery(
      api.workspaces.getPersonalWorkspace,
      {}
    )) as Doc<"workspaces"> | null;

    if (!personalWorkspace) throw new Error("Personal workspace not found");

    // Шерим документ в персональный воркспейс пользователя
    const result = (await ctx.runMutation(api.documents.mutations.shareDocument, {
      documentId: args.documentId,
      targetWorkspaceId: personalWorkspace._id,
      accessLevel: args.accessLevel,
    })) as Id<"entityAccess">;

    return result;
  },
});
