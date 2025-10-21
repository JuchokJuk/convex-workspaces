import { mutation } from "../_generated/server";
import { v } from "convex/values";
import { api } from "../_generated/api";
import { requireAuth } from "../utils/requireAuth";

export const createTask = mutation({
  args: {
    entityId: v.id("entities"),
    title: v.string(),
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
    if (!membership) throw new Error("Access denied");

    return await ctx.db.insert("tasks", {
      entityId: args.entityId,
      title: args.title,
    });
  },
});

export const updateTask = mutation({
  args: {
    taskId: v.id("tasks"),
    title: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await requireAuth(ctx);

    const task = await ctx.db.get(args.taskId);
    if (!task) throw new Error("Task not found");

    // Проверяем доступ к entity через convex-workspaces
    const entity = await ctx.db.get(task.entityId);
    if (!entity) throw new Error("Entity not found");

    const membership = await ctx.runQuery(
      api.workspaces.getCurrentUserMembership,
      {
        workspaceId: entity.workspaceId,
      }
    );
    if (!membership) throw new Error("Access denied");

    const { taskId, ...updates } = args;
    await ctx.db.patch(taskId, updates);
  },
});

export const removeTask = mutation({
  args: {
    taskId: v.id("tasks"),
  },
  handler: async (ctx, args) => {
    await requireAuth(ctx);

    const task = await ctx.db.get(args.taskId);
    if (!task) throw new Error("Task not found");

    // Проверяем доступ к entity через convex-workspaces
    const entity = await ctx.db.get(task.entityId);
    if (!entity) throw new Error("Entity not found");

    const membership = await ctx.runQuery(
      api.workspaces.getCurrentUserMembership,
      {
        workspaceId: entity.workspaceId,
      }
    );
    if (!membership) throw new Error("Access denied");

    await ctx.db.delete(args.taskId);
  },
});
