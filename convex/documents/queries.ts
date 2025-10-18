import { query } from "../_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";
import { hasAccessToDocument, canEditDocument, hasAccessToProject } from "../utils/accessControl";

// Получение документа по ID
export const getDocument = query({
  args: { documentId: v.id("documents") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.documentId);
  },
});

// Получение всех документов проекта
export const getProjectDocuments = query({
  args: { projectId: v.id("projects") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    // Проверяем, что пользователь имеет доступ к проекту
    const userWorkspaces = await ctx.db
      .query("workspaceUsers")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();

    let hasProjectAccess = false;
    for (const wu of userWorkspaces) {
      if (await hasAccessToProject(ctx, userId, wu.workspaceId, args.projectId)) {
        hasProjectAccess = true;
        break;
      }
    }
    if (!hasProjectAccess) return [];

    return await ctx.db
      .query("documents")
      .filter((q) => q.eq(q.field("projectId"), args.projectId))
      .collect();
  },
});

// Получение всех документов текущего пользователя
export const getUserDocuments = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    return await ctx.db
      .query("documents")
      .filter((q) => q.eq(q.field("authorId"), userId))
      .collect();
  },
});

// Проверка доступа к документу
export const hasAccess = query({
  args: { documentId: v.id("documents") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return false;

    return await hasAccessToDocument(ctx, userId, args.documentId);
  },
});

// Проверка прав на редактирование документа
export const canEdit = query({
  args: { documentId: v.id("documents") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return false;

    return await canEditDocument(ctx, userId, args.documentId);
  },
});

