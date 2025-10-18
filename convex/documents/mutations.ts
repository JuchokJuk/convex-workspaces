import { mutation } from "../_generated/server";
import { v } from "convex/values";
import { requireAuth } from "../utils/authUtils";
import { hasAccessToProject, canEditDocument, getUserRoleInProject } from "../utils/accessControl";
import { ROLE_HIERARCHY } from "../utils/roles";
import { internal } from "../_generated/api";

// Создание документа
export const createDocument = mutation({
  args: {
    name: v.string(),
    content: v.string(),
    projectId: v.id("projects"),
  },
  handler: async (ctx, args) => {
    const userId = await requireAuth(ctx);

    // Проверяем, что проект существует
    const project = await ctx.db.get(args.projectId);
    if (!project) {
      throw new Error("Project not found");
    }

    // Проверяем, что пользователь имеет доступ к проекту через любой воркспейс
    const userWorkspaces = await ctx.db
      .query("workspaceUsers")
      .withIndex("by_user", (q: any) => q.eq("userId", userId))
      .collect();

    let hasProjectAccess = false;
    for (const wu of userWorkspaces) {
      if (await hasAccessToProject(ctx, userId, wu.workspaceId, args.projectId)) {
        hasProjectAccess = true;
        break;
      }
    }
    if (!hasProjectAccess) {
      throw new Error("User does not have access to project");
    }

    const documentId = await ctx.db.insert("documents", {
      name: args.name,
      content: args.content,
      projectId: args.projectId,
      authorId: userId,
      updatedAt: Date.now(),
    });

    return documentId;
  },
});

// Обновление документа
export const updateDocument = mutation({
  args: {
    documentId: v.id("documents"),
    name: v.optional(v.string()),
    content: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await requireAuth(ctx);
    const document = await ctx.db.get(args.documentId);
    if (!document) {
      throw new Error("Document not found");
    }

    // Проверяем права на редактирование
    const canEdit = await canEditDocument(ctx, userId, args.documentId);
    if (!canEdit) {
      throw new Error("User does not have edit permissions for this document");
    }

    await ctx.db.patch(args.documentId, {
      updatedAt: Date.now(),
      name: args.name,
      content: args.content,
    });
    return await ctx.db.get(args.documentId);
  },
});

// Удаление документа
export const deleteDocument = mutation({
  args: {
    documentId: v.id("documents"),
  },
  handler: async (ctx, args) => {
    const userId = await requireAuth(ctx);
    const document = await ctx.db.get(args.documentId);
    if (!document) {
      throw new Error("Document not found");
    }

    // Проверяем права на удаление (только автор или админ)
    const isAuthor = document.authorId === userId;
    let isAdmin = false;

    if (!isAuthor) {
      const userWorkspaces = await ctx.db
        .query("workspaceUsers")
        .withIndex("by_user", (q: any) => q.eq("userId", userId))
        .collect();

      for (const wu of userWorkspaces) {
        const role = await getUserRoleInProject(ctx, userId, wu.workspaceId, document.projectId);
        if (role && ROLE_HIERARCHY[role] === ROLE_HIERARCHY.admin) {
          isAdmin = true;
          break;
        }
      }
    }

    if (!isAuthor && !isAdmin) {
      throw new Error("User does not have delete permissions for this document");
    }

    await ctx.scheduler.runAfter(0, internal.utils.cascadeDeletion.deleteDocumentCascade, {
      documentId: args.documentId,
    });
    return { success: true };
  },
});

