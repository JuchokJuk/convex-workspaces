import { internalMutation } from "../_generated/server";
import { Id } from "../_generated/dataModel";
import { v } from "convex/values";
import { internal } from "../_generated/api";

// Тип для результатов каскадного удаления
export type DeletionResult = {
  success: boolean;
  deletedEntities: {
    users?: Id<"users">[];
    workspaces?: Id<"workspaces">[];
    projects?: Id<"projects">[];
    workspaceUsers?: Id<"workspaceUsers">[];
    workspaceProjects?: Id<"workspaceProjects">[];
    documents?: Id<"documents">[];
    reports?: Id<"reports">[];
  };
  errors: string[];
};

export const deleteUserCascade = internalMutation({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const result: DeletionResult = {
      success: true,
      deletedEntities: {
        users: [args.userId],
        workspaces: [],
        projects: [],
        workspaceUsers: [],
        workspaceProjects: [],
        documents: [],
        reports: [],
      },
      errors: [],
    };

    try {
      // 1. Удаляем все связи пользователя с воркспейсами
      const workspaceUsers = await ctx.db
        .query("workspaceUsers")
        .withIndex("by_user", (q) => q.eq("userId", args.userId))
        .collect();
      for (const wu of workspaceUsers) {
        await ctx.db.delete(wu._id);
        result.deletedEntities.workspaceUsers?.push(wu._id);
      }

      // 2. Каскадно удаляем все воркспейсы, где пользователь является владельцем
      const ownedWorkspaces = await ctx.db
        .query("workspaces")
        .withIndex("by_owner", (q) => q.eq("ownerId", args.userId))
        .collect();
      for (const workspace of ownedWorkspaces) {
        const workspaceDeletionResult = await ctx.runMutation(internal.utils.cascadeDeletion.deleteWorkspaceCascade, {
          workspaceId: workspace._id,
        });
        if (!workspaceDeletionResult.success) {
          result.success = false;
          result.errors.push(...workspaceDeletionResult.errors);
        }
        // Объединяем удаленные сущности
        const sourceEntities = workspaceDeletionResult.deletedEntities;
        if (sourceEntities.users) {
          result.deletedEntities.users?.push(...sourceEntities.users);
        }
        if (sourceEntities.workspaces) {
          result.deletedEntities.workspaces?.push(...sourceEntities.workspaces);
        }
        if (sourceEntities.projects) {
          result.deletedEntities.projects?.push(...sourceEntities.projects);
        }
        if (sourceEntities.workspaceUsers) {
          result.deletedEntities.workspaceUsers?.push(...sourceEntities.workspaceUsers);
        }
        if (sourceEntities.workspaceProjects) {
          result.deletedEntities.workspaceProjects?.push(...sourceEntities.workspaceProjects);
        }
        if (sourceEntities.documents) {
          result.deletedEntities.documents?.push(...sourceEntities.documents);
        }
        if (sourceEntities.reports) {
          result.deletedEntities.reports?.push(...sourceEntities.reports);
        }
      }

      // 3. Каскадно удаляем все проекты, где пользователь является владельцем
      const ownedProjects = await ctx.db
        .query("projects")
        .filter((q) => q.eq(q.field("ownerId"), args.userId))
        .collect();
      for (const project of ownedProjects) {
        const projectDeletionResult = await ctx.runMutation(internal.utils.cascadeDeletion.deleteProjectCascade, {
          projectId: project._id,
        });
        if (!projectDeletionResult.success) {
          result.success = false;
          result.errors.push(...projectDeletionResult.errors);
        }
        // Объединяем удаленные сущности
        const sourceEntities = projectDeletionResult.deletedEntities;
        if (sourceEntities.users) {
          result.deletedEntities.users?.push(...sourceEntities.users);
        }
        if (sourceEntities.workspaces) {
          result.deletedEntities.workspaces?.push(...sourceEntities.workspaces);
        }
        if (sourceEntities.projects) {
          result.deletedEntities.projects?.push(...sourceEntities.projects);
        }
        if (sourceEntities.workspaceUsers) {
          result.deletedEntities.workspaceUsers?.push(...sourceEntities.workspaceUsers);
        }
        if (sourceEntities.workspaceProjects) {
          result.deletedEntities.workspaceProjects?.push(...sourceEntities.workspaceProjects);
        }
        if (sourceEntities.documents) {
          result.deletedEntities.documents?.push(...sourceEntities.documents);
        }
        if (sourceEntities.reports) {
          result.deletedEntities.reports?.push(...sourceEntities.reports);
        }
      }

      // 4. Удаляем самого пользователя
      await ctx.db.delete(args.userId);
    } catch (error) {
      result.success = false;
      const errorMessage = error instanceof Error ? error.message : String(error);
      result.errors.push(`Error deleting user: ${errorMessage}`);
    }
    return result;
  },
});

export const deleteWorkspaceCascade = internalMutation({
  args: { workspaceId: v.id("workspaces") },
  handler: async (ctx, args) => {
    const result: DeletionResult = {
      success: true,
      deletedEntities: {
        workspaceUsers: [],
        workspaceProjects: [],
        workspaces: [args.workspaceId],
      },
      errors: [],
    };

    try {
      // 1. Удаляем все связи пользователей с воркспейсом
      const workspaceUsers = await ctx.db
        .query("workspaceUsers")
        .withIndex("by_workspace_user", (q: any) => q.eq("workspaceId", args.workspaceId))
        .collect();
      for (const wu of workspaceUsers) {
        await ctx.db.delete(wu._id);
        result.deletedEntities.workspaceUsers?.push(wu._id);
      }

      // 2. Удаляем все связи проектов с воркспейсом
      const workspaceProjects = await ctx.db
        .query("workspaceProjects")
        .withIndex("by_workspace_project", (q: any) => q.eq("workspaceId", args.workspaceId))
        .collect();
      for (const wp of workspaceProjects) {
        await ctx.db.delete(wp._id);
        result.deletedEntities.workspaceProjects?.push(wp._id);
      }

      // 3. Удаляем сам воркспейс
      await ctx.db.delete(args.workspaceId);
    } catch (error) {
      result.success = false;
      const errorMessage = error instanceof Error ? error.message : String(error);
      result.errors.push(`Error deleting workspace: ${errorMessage}`);
    }
    return result;
  },
});

export const deleteProjectCascade = internalMutation({
  args: { projectId: v.id("projects") },
  handler: async (ctx, args) => {
    const result: DeletionResult = {
      success: true,
      deletedEntities: {
        documents: [],
        reports: [],
        workspaceProjects: [],
        projects: [args.projectId],
      },
      errors: [],
    };

    try {
      // 1. Удаляем все документы проекта
      const documents = await ctx.db
        .query("documents")
        .filter((q) => q.eq(q.field("projectId"), args.projectId))
        .collect();
      for (const doc of documents) {
        await ctx.db.delete(doc._id);
        result.deletedEntities.documents?.push(doc._id);
      }

      // 2. Удаляем все отчеты проекта
      const reports = await ctx.db
        .query("reports")
        .filter((q) => q.eq(q.field("projectId"), args.projectId))
        .collect();
      for (const report of reports) {
        await ctx.db.delete(report._id);
        result.deletedEntities.reports?.push(report._id);
      }

      // 3. Удаляем все связи проекта с воркспейсами
      const workspaceProjects = await ctx.db
        .query("workspaceProjects")
        .withIndex("by_project_workspace", (q: any) => q.eq("projectId", args.projectId))
        .collect();
      for (const wp of workspaceProjects) {
        await ctx.db.delete(wp._id);
        result.deletedEntities.workspaceProjects?.push(wp._id);
      }

      // 4. Удаляем сам проект
      await ctx.db.delete(args.projectId);
    } catch (error) {
      result.success = false;
      const errorMessage = error instanceof Error ? error.message : String(error);
      result.errors.push(`Error deleting project: ${errorMessage}`);
    }
    return result;
  },
});

export const deleteDocumentCascade = internalMutation({
  args: { documentId: v.id("documents") },
  handler: async (ctx, args) => {
    const result: DeletionResult = {
      success: true,
      deletedEntities: {
        documents: [args.documentId],
      },
      errors: [],
    };

    try {
      await ctx.db.delete(args.documentId);
    } catch (error: any) {
      result.success = false;
      result.errors.push(`Error deleting document: ${error.message}`);
    }
    return result;
  },
});

export const deleteReportCascade = internalMutation({
  args: { reportId: v.id("reports") },
  handler: async (ctx, args) => {
    const result: DeletionResult = {
      success: true,
      deletedEntities: {
        reports: [args.reportId],
      },
      errors: [],
    };

    try {
      await ctx.db.delete(args.reportId);
    } catch (error: any) {
      result.success = false;
      result.errors.push(`Error deleting report: ${error.message}`);
    }
    return result;
  },
});

export const clearAllData = internalMutation({
  args: {},
  handler: async (ctx) => {
    const result: DeletionResult = {
      success: true,
      deletedEntities: {},
      errors: [],
    };

    const tables = [
      "documents",
      "reports",
      "workspaceProjects",
      "workspaceUsers",
      "projects",
      "workspaces",
      "users",
    ];

    for (const table of tables) {
      const docs = await ctx.db.query(table as any).collect();
      for (const doc of docs) {
        await ctx.db.delete(doc._id);
        if (!(result.deletedEntities as any)[table]) {
          (result.deletedEntities as any)[table] = [];
        }
        (result.deletedEntities as any)[table].push(doc._id);
      }
    }
    return result;
  },
});
