import { query } from "../_generated/server";
import { v } from "convex/values";
import { api } from "../_generated/api";
import { requireAuth } from "../utils/requireAuth";
import { UserRole } from "../../src/types";
import { Id } from "../_generated/dataModel";

export const getTaskById = query({
  args: {
    taskId: v.id("tasks"),
  },
  handler: async (ctx, args) => {
    await requireAuth(ctx);

    const task = await ctx.db.get(args.taskId);
    if (!task) return null;

    // Проверяем доступ к entity через convex-workspaces
    const entity = await ctx.db.get(task.entityId);
    if (!entity) throw new Error("Entity not found");

    const membership = await ctx.runQuery(
      api.workspaces.getCurrentUserMembership,
      {
        workspaceId: entity.workspaceId,
      }
    );
    if (!membership) throw new Error("Access denied - tasks cannot be shared");

    return task;
  },
});

export const getTasksByEntity = query({
  args: {
    entityId: v.id("entities"),
  },
  handler: async (ctx, args) => {
    await requireAuth(ctx);

    // Проверяем доступ к entity через convex-workspaces
    const entity = await ctx.db.get(args.entityId);
    if (!entity) throw new Error("Entity not found");

    const membership = await ctx.runQuery(
      api.workspaces.getCurrentUserMembership,
      {
        workspaceId: entity.workspaceId,
      }
    );
    if (!membership) throw new Error("Access denied - tasks cannot be shared");

    return await ctx.db
      .query("tasks")
      .withIndex("by_entity", (q) => q.eq("entityId", args.entityId))
      .collect();
  },
});

export const getUserAccessibleTasks = query({
  args: {},
  handler: async (ctx, args) => {
    await requireAuth(ctx);

    // Получаем все доступные entities через convex-workspaces
    const accessibleEntities = await ctx.runQuery(
      api.workspaces.getUserAccessibleEntities,
      {}
    );

    const tasks: {
      _id: Id<"tasks">;
      _creationTime: number;
      entityId: Id<"entities">;
      userRole: UserRole;
      workspaceId: Id<"workspaces">;
    }[] = [];

    for (const entity of accessibleEntities) {
      const entityTasks = await ctx.db
        .query("tasks")
        .withIndex("by_entity", (q) => q.eq("entityId", entity._id))
        .collect();

      for (const task of entityTasks) {
        tasks.push({
          ...task,
          userRole: entity.userRole,
          workspaceId: entity.workspaceId,
        });
      }
    }

    return tasks;
  },
});
