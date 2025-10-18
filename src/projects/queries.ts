import { query, v } from "../convex-stubs";
import { requireAuth } from "../utils/authUtils";
import { requirePersonalWorkspace } from "../utils/requirePersonalWorkspace";

// Вспомогательная функция для получения роли проекта
async function getProjectRoleInternal(ctx: any, userId: string, projectId: string) {
  const project = await ctx.db.get(projectId as any);
  if (!project) return null;

  // Сначала проверяем роль в воркспейсе
  const workspaceRole = await ctx.db
    .query("workspaceUsers")
    .withIndex("by_workspace_user", (q: any) =>
      q.eq("workspaceId", project.workspaceId).eq("userId", userId)
    )
    .first();

  if (workspaceRole) {
    return workspaceRole.userRole;
  }

  // Затем проверяем расшаренный доступ
  const personalWorkspace = await requirePersonalWorkspace(ctx, userId as any);
  
  const sharedAccess = await ctx.db
    .query("workspaceProjects")
    .withIndex("by_project_workspace", (q: any) =>
      q.eq("projectId", projectId).eq("workspaceId", personalWorkspace._id)
    )
    .first();

  return sharedAccess?.accessLevel || null;
}

export const getProject = query({
  args: { projectId: v.id("projects") },
  handler: async (ctx: any, args: any) => {
    const userId = await requireAuth(ctx);
    return await ctx.db.get(args.projectId);
  },
});

export const getUserProjectsWithRoles = query({
  args: {},
  handler: async (ctx: any) => {
    const userId = await requireAuth(ctx);

    const personalWorkspace = await requirePersonalWorkspace(ctx, userId as any);

    const workspaceProjects = await ctx.db
      .query("workspaceProjects")
      .withIndex("by_workspace_project", (q: any) => q.eq("workspaceId", personalWorkspace._id))
      .collect();

    const projectsWithRoles = await Promise.all(
      workspaceProjects.map(async (wp: any) => {
        const project = await ctx.db.get(wp.projectId);
        const workspace = await ctx.db.get(project?.workspaceId);
        return project && workspace ? {
          project,
          workspace,
          role: wp.accessLevel,
        } : null;
      })
    );

    return projectsWithRoles.filter(Boolean);
  },
});

export const getProjectRole = query({
  args: { projectId: v.id("projects") },
  handler: async (ctx: any, args: any) => {
    const userId = await requireAuth(ctx);
    return await getProjectRoleInternal(ctx, userId, args.projectId);
  },
});

export const canEditProject = query({
  args: { projectId: v.id("projects") },
  handler: async (ctx: any, args: any) => {
    const userId = await requireAuth(ctx);
    const role = await getProjectRoleInternal(ctx, userId, args.projectId);
    return role === "admin" || role === "editor";
  },
});

export const canDeleteProject = query({
  args: { projectId: v.id("projects") },
  handler: async (ctx: any, args: any) => {
    const userId = await requireAuth(ctx);
    const role = await getProjectRoleInternal(ctx, userId, args.projectId);
    return role === "admin";
  },
});
