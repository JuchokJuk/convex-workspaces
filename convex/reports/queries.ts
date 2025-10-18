import { query } from "../_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";
import { hasAccessToReport, canEditReport, hasAccessToProject } from "../utils/accessControl";

// Получение отчета по ID
export const getReport = query({
  args: { reportId: v.id("reports") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.reportId);
  },
});

// Получение всех отчетов проекта
export const getProjectReports = query({
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
      .query("reports")
      .filter((q) => q.eq(q.field("projectId"), args.projectId))
      .collect();
  },
});

// Получение всех отчетов текущего пользователя
export const getUserReports = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    return await ctx.db
      .query("reports")
      .filter((q) => q.eq(q.field("authorId"), userId))
      .collect();
  },
});

// Проверка доступа к отчету
export const hasAccess = query({
  args: { reportId: v.id("reports") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return false;

    return await hasAccessToReport(ctx, userId, args.reportId);
  },
});

// Проверка прав на редактирование отчета
export const canEdit = query({
  args: { reportId: v.id("reports") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return false;

    return await canEditReport(ctx, userId, args.reportId);
  },
});

