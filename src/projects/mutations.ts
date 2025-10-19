import {
  GenericDataModel,
  GenericMutationCtx,
  mutationGeneric,
} from "convex/server";
import { v } from "convex/values";
import { requireAuth } from "../utils/authUtils";
import { requirePersonalWorkspace } from "../utils/requirePersonalWorkspace";

export const createProject = mutationGeneric({
  args: {
    workspaceId: v.id("workspaces"),
    name: v.string(),
    description: v.optional(v.string()),
  },
  handler: async (ctx: GenericMutationCtx<GenericDataModel>, args: any) => {
    const userId = await requireAuth(ctx);

    // Проверяем, что пользователь имеет права на создание проектов в воркспейсе
    const workspaceUser = await ctx.db
      .query("workspaceUsers")
      .withIndex("by_workspace_user", (q: any) =>
        q.eq("workspaceId", args.workspaceId).eq("userId", userId)
      )
      .first();

    if (
      !workspaceUser ||
      (workspaceUser.userRole !== "admin" &&
        workspaceUser.userRole !== "editor")
    ) {
      throw new Error(
        "User does not have permission to create projects in this workspace"
      );
    }

    const projectId = await ctx.db.insert("projects", {
      name: args.name,
      description: args.description,
      workspaceId: args.workspaceId,
      ownerId: userId,
    });

    // Добавляем проект в воркспейс с ролью admin для создателя
    await ctx.db.insert("workspaceProjects", {
      workspaceId: args.workspaceId,
      projectId,
      accessLevel: "admin",
    });

    return projectId;
  },
});

export const shareProject = mutationGeneric({
  args: {
    sourceWorkspaceId: v.id("workspaces"),
    projectId: v.id("projects"),
    targetUserId: v.id("users"),
    targetUserRole: v.union(
      v.literal("admin"),
      v.literal("editor"),
      v.literal("viewer")
    ),
  },
  handler: async (ctx: any, args: any) => {
    const currentUserId = await requireAuth(ctx);

    // Получаем роль текущего пользователя в исходном воркспейсе
    const currentUserWorkspaceRole = await ctx.db
      .query("workspaceUsers")
      .withIndex("by_workspace_user", (q: any) =>
        q.eq("workspaceId", args.sourceWorkspaceId).eq("userId", currentUserId)
      )
      .first();

    if (!currentUserWorkspaceRole) {
      throw new Error("Current user is not a member of the source workspace");
    }

    // Определяем эффективную роль (принцип наименьших привилегий)
    const senderRole = currentUserWorkspaceRole.userRole;
    const effectiveRole =
      senderRole === "admin"
        ? args.targetUserRole
        : senderRole === "editor" && args.targetUserRole !== "admin"
        ? args.targetUserRole
        : "viewer";

    // Получаем персональный воркспейс целевого пользователя
    const targetPersonalWorkspace = await requirePersonalWorkspace(
      ctx,
      args.targetUserId
    );

    // Проверяем, не расшарен ли уже проект
    const existingShare = await ctx.db
      .query("workspaceProjects")
      .withIndex("by_project_workspace", (q: any) =>
        q
          .eq("projectId", args.projectId)
          .eq("workspaceId", targetPersonalWorkspace._id)
      )
      .first();

    if (existingShare) {
      throw new Error("Project is already shared with this user");
    }

    // Добавляем проект в персональный воркспейс целевого пользователя
    await ctx.db.insert("workspaceProjects", {
      workspaceId: targetPersonalWorkspace._id,
      projectId: args.projectId,
      accessLevel: effectiveRole,
    });

    return { accessLevel: effectiveRole };
  },
});

export function assembleDeleteProject(
  onProjectDelete?: (ctx: any, projectId: any) => Promise<void>
) {
  return mutationGeneric({
    args: { projectId: v.id("projects") },
    handler: async (ctx: any, args: any) => {
      const userId = await requireAuth(ctx);

      const project = await ctx.db.get(args.projectId);
      if (!project) {
        throw new Error("Project not found");
      }

      // Проверяем права на удаление (только admin в воркспейсе или владелец проекта)
      const workspaceRole = await ctx.db
        .query("workspaceUsers")
        .withIndex("by_workspace_user", (q: any) =>
          q.eq("workspaceId", project.workspaceId).eq("userId", userId)
        )
        .first();

      const canDelete =
        workspaceRole?.userRole === "admin" || project.ownerId === userId;

      if (!canDelete) {
        throw new Error("User does not have permission to delete this project");
      }

      // Удаляем связи проекта с воркспейсами
      const workspaceProjects = await ctx.db
        .query("workspaceProjects")
        .withIndex("by_project_workspace", (q: any) =>
          q.eq("projectId", args.projectId)
        )
        .collect();

      await Promise.all(
        workspaceProjects.map((wp: any) => ctx.db.delete(wp._id))
      );

      // Вызываем кастомный колбек
      await onProjectDelete?.(ctx, args.projectId);

      // Удаляем сам проект
      await ctx.db.delete(args.projectId);
      return { success: true };
    },
  });
}
