import { GenericId } from "convex/values";
import { requirePersonalWorkspace } from "./requirePersonalWorkspace";

export type UserRole = "admin" | "editor" | "viewer";
export type ProjectRole = "admin" | "editor" | "viewer";

export async function getWorkspaceRole(
  ctx: any,
  userId: GenericId<"users">,
  workspaceId: GenericId<"workspaces">
): Promise<UserRole | null> {
  const workspaceUser = await ctx.db
    .query("workspaceUsers")
    .withIndex("by_workspace_user", (q: any) =>
      q.eq("workspaceId", workspaceId).eq("userId", userId)
    )
    .first();

  return workspaceUser?.userRole || null;
}

export async function getProjectRole(
  ctx: any,
  userId: GenericId<"users">,
  projectId: GenericId<"projects">
): Promise<ProjectRole | null> {
  const project = await ctx.db.get(projectId);
  if (!project) return null;

  // Сначала проверяем роль в воркспейсе
  const workspaceRole = await getWorkspaceRole(
    ctx,
    userId,
    project.workspaceId
  );
  if (workspaceRole) {
    return workspaceRole;
  }

  // Затем проверяем расшаренный доступ
  const personalWorkspace = await requirePersonalWorkspace(ctx, userId);

  const sharedAccess = await ctx.db
    .query("workspaceProjects")
    .withIndex("by_project_workspace", (q: any) =>
      q.eq("projectId", projectId).eq("workspaceId", personalWorkspace._id)
    )
    .first();

  return sharedAccess?.accessLevel || null;
}

export async function canEditProject(
  ctx: any,
  userId: GenericId<"users">,
  projectId: GenericId<"projects">
): Promise<boolean> {
  const role = await getProjectRole(ctx, userId, projectId);
  return role === "admin" || role === "editor";
}

export async function canDeleteProject(
  ctx: any,
  userId: GenericId<"users">,
  projectId: GenericId<"projects">
): Promise<boolean> {
  const role = await getProjectRole(ctx, userId, projectId);
  return role === "admin";
}
