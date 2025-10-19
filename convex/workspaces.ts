import { convexWorkspaces } from "../src/convexWorkspaces";
import { Id } from "./_generated/dataModel";
import { MutationCtx } from "./_generated/server";

export const {
  // Workspace mutations
  createWorkspace,
  addUserToWorkspace,
  deleteWorkspace,

  // Project mutations
  createProject,
  shareProject,
  deleteProject,

  // Workspace queries
  getPersonalWorkspace,
  getUserWorkspaces,
  getWorkspace,
  getWorkspaceRole,

  // Project queries
  getProject,
  getUserProjectsWithRoles,
  getProjectRole,
  canEditProject,
  canDeleteProject,
} = convexWorkspaces({
  callbacks: {
    onProjectDelete: async (ctx: MutationCtx, projectId: Id<"projects">) => {
      // Удаляем все документы проекта
      const documents = await ctx.db
        .query("documents")
        .withIndex("by_project", (q) => q.eq("projectId", projectId))
        .collect();

      await Promise.all(documents.map((doc) => ctx.db.delete(doc._id)));

      // Удаляем все отчеты проекта
      const reports = await ctx.db
        .query("reports")
        .withIndex("by_project", (q) => q.eq("projectId", projectId))
        .collect();

      await Promise.all(
        reports.map((report) => ctx.db.delete(report._id))
      );
    },
  },
});
