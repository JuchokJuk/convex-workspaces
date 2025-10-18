import { QueryCtx, MutationCtx } from "../_generated/server";
import { Id } from "../_generated/dataModel";
import { ROLE_HIERARCHY, Role, getEffectiveRole } from "./roles";

// Helper to check if a user has any role in a workspace
export async function hasAccessToWorkspace(
  ctx: QueryCtx | MutationCtx,
  userId: Id<"users">,
  workspaceId: Id<"workspaces">
): Promise<boolean> {
  const workspaceUser = await ctx.db
    .query("workspaceUsers")
    .withIndex("by_workspace_user", (q) =>
      q.eq("workspaceId", workspaceId).eq("userId", userId)
    )
    .first();
  return !!workspaceUser;
}

// Helper to get a user's effective role in a project within a specific workspace
export async function getUserRoleInProject(
  ctx: QueryCtx | MutationCtx,
  userId: Id<"users">,
  workspaceId: Id<"workspaces">,
  projectId: Id<"projects">
): Promise<Role | null> {
  const workspaceProject = await ctx.db
    .query("workspaceProjects")
    .withIndex("by_workspace_project", (q) =>
      q.eq("workspaceId", workspaceId).eq("projectId", projectId)
    )
    .first();
  const workspaceUser = await ctx.db
    .query("workspaceUsers")
    .withIndex("by_workspace_user", (q) =>
      q.eq("workspaceId", workspaceId).eq("userId", userId)
    )
    .first();

  if (!workspaceProject || !workspaceUser) {
    return null;
  }

  return getEffectiveRole(workspaceUser.userRole, workspaceProject.accessLevel);
}

// Helper to check if a user has access to a project through any workspace
export async function hasAccessToProject(
  ctx: QueryCtx | MutationCtx,
  userId: Id<"users">,
  workspaceId: Id<"workspaces">,
  projectId: Id<"projects">
): Promise<boolean> {
  const project = await ctx.db.get(projectId);
  if (!project) return false;

  // Owner of the project always has access
  if (project.ownerId === userId) return true;

  // Check access through the specific workspace
  const role = await getUserRoleInProject(ctx, userId, workspaceId, projectId);
  return !!role;
}

// Helper to check if a user has access to a document
export async function hasAccessToDocument(
  ctx: QueryCtx | MutationCtx,
  userId: Id<"users">,
  documentId: Id<"documents">
): Promise<boolean> {
  const document = await ctx.db.get(documentId);
  if (!document) return false;

  const project = await ctx.db.get(document.projectId);
  if (!project) return false;

  // Owner of the project always has access
  if (project.ownerId === userId) return true;

  // Check access through any workspace
  const userWorkspaces = await ctx.db
    .query("workspaceUsers")
    .withIndex("by_user", (q) => q.eq("userId", userId))
    .collect();

  for (const wu of userWorkspaces) {
    const role = await getUserRoleInProject(ctx, userId, wu.workspaceId, document.projectId);
    if (role) return true;
  }
  return false;
}

// Helper to check if a user can edit a document
export async function canEditDocument(
  ctx: QueryCtx | MutationCtx,
  userId: Id<"users">,
  documentId: Id<"documents">
): Promise<boolean> {
  const document = await ctx.db.get(documentId);
  if (!document) return false;

  // Author can always edit
  if (document.authorId === userId) return true;

  // Check access through any workspace
  const userWorkspaces = await ctx.db
    .query("workspaceUsers")
    .withIndex("by_user", (q) => q.eq("userId", userId))
    .collect();

  for (const wu of userWorkspaces) {
    const role = await getUserRoleInProject(ctx, userId, wu.workspaceId, document.projectId);
    if (role && ROLE_HIERARCHY[role] >= ROLE_HIERARCHY.editor) {
      return true;
    }
  }
  return false;
}

// Helper to check if a user has access to a report
export async function hasAccessToReport(
  ctx: QueryCtx | MutationCtx,
  userId: Id<"users">,
  reportId: Id<"reports">
): Promise<boolean> {
  const report = await ctx.db.get(reportId);
  if (!report) return false;

  const project = await ctx.db.get(report.projectId);
  if (!project) return false;

  // Owner of the project always has access
  if (project.ownerId === userId) return true;

  // Check access through any workspace
  const userWorkspaces = await ctx.db
    .query("workspaceUsers")
    .withIndex("by_user", (q) => q.eq("userId", userId))
    .collect();

  for (const wu of userWorkspaces) {
    const role = await getUserRoleInProject(ctx, userId, wu.workspaceId, report.projectId);
    if (role) return true;
  }
  return false;
}

// Helper to check if a user can edit a report
export async function canEditReport(
  ctx: QueryCtx | MutationCtx,
  userId: Id<"users">,
  reportId: Id<"reports">
): Promise<boolean> {
  const report = await ctx.db.get(reportId);
  if (!report) return false;

  // Author can always edit
  if (report.authorId === userId) return true;

  // Check access through any workspace
  const userWorkspaces = await ctx.db
    .query("workspaceUsers")
    .withIndex("by_user", (q) => q.eq("userId", userId))
    .collect();

  for (const wu of userWorkspaces) {
    const role = await getUserRoleInProject(ctx, userId, wu.workspaceId, report.projectId);
    if (role && ROLE_HIERARCHY[role] >= ROLE_HIERARCHY.editor) {
      return true;
    }
  }
  return false;
}
