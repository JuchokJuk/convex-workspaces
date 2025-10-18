import { mutation } from "../_generated/server";
import { v } from "convex/values";
import { requireAuth } from "../utils/authUtils";
import { hasAccessToProject, canEditReport, getUserRoleInProject } from "../utils/accessControl";
import { ROLE_HIERARCHY } from "../utils/roles";
import { internal } from "../_generated/api";

// Создание отчета
export const createReport = mutation({
  args: {
    name: v.string(),
    data: v.any(),
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
      .withIndex("by_user", (q) => q.eq("userId", userId))
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

    const reportId = await ctx.db.insert("reports", {
      name: args.name,
      data: args.data,
      projectId: args.projectId,
      authorId: userId,
      updatedAt: Date.now(),
    });

    return reportId;
  },
});

// Обновление отчета
export const updateReport = mutation({
  args: {
    reportId: v.id("reports"),
    name: v.optional(v.string()),
    data: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    const userId = await requireAuth(ctx);
    const report = await ctx.db.get(args.reportId);
    if (!report) {
      throw new Error("Report not found");
    }

    // Проверяем права на редактирование
    const canEdit = await canEditReport(ctx, userId, args.reportId);
    if (!canEdit) {
      throw new Error("User does not have edit permissions for this report");
    }

    await ctx.db.patch(args.reportId, {
      updatedAt: Date.now(),
      name: args.name,
      data: args.data,
    });
    return await ctx.db.get(args.reportId);
  },
});

// Удаление отчета
export const deleteReport = mutation({
  args: {
    reportId: v.id("reports"),
  },
  handler: async (ctx, args) => {
    const userId = await requireAuth(ctx);
    const report = await ctx.db.get(args.reportId);
    if (!report) {
      throw new Error("Report not found");
    }

    // Проверяем права на удаление (только автор или админ)
    const isAuthor = report.authorId === userId;
    let isAdmin = false;

    if (!isAuthor) {
      const userWorkspaces = await ctx.db
        .query("workspaceUsers")
        .withIndex("by_user", (q) => q.eq("userId", userId))
        .collect();

      for (const wu of userWorkspaces) {
        const role = await getUserRoleInProject(ctx, userId, wu.workspaceId, report.projectId);
        if (role && ROLE_HIERARCHY[role] === ROLE_HIERARCHY.admin) {
          isAdmin = true;
          break;
        }
      }
    }

    if (!isAuthor && !isAdmin) {
      throw new Error("User does not have delete permissions for this report");
    }

    await ctx.scheduler.runAfter(0, internal.utils.cascadeDeletion.deleteReportCascade, {
      reportId: args.reportId,
    });
    return { success: true };
  },
});

