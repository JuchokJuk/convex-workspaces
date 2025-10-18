import { mutation, MutationCtx } from "../_generated/server";
import schema from "../schema";

export const clear = mutation(async (ctx: MutationCtx) => {
  for (const table of Object.keys(schema.tables)) {
    const docs = await ctx.db
      .query(table as keyof typeof schema.tables)
      .collect();
    await Promise.all(docs.map((doc) => ctx.db.delete(doc._id)));
  }
  // clear scheduled jobs and storage
  const scheduled = await ctx.db.system.query("_scheduled_functions").collect();
  await Promise.all(scheduled.map((s) => ctx.scheduler.cancel(s._id)));
  const storedFiles = await ctx.db.system.query("_storage").collect();
  await Promise.all(storedFiles.map((s) => ctx.storage.delete(s._id)));
});

// Получение статистики данных (для тестов)
export const getDataStats = mutation({
  args: {},
  handler: async (ctx) => {
    const users = await ctx.db.query("users").collect();
    const workspaces = await ctx.db.query("workspaces").collect();
    const projects = await ctx.db.query("projects").collect();
    const workspaceUsers = await ctx.db.query("workspaceUsers").collect();
    const workspaceProjects = await ctx.db.query("workspaceProjects").collect();
    const documents = await ctx.db.query("documents").collect();
    const reports = await ctx.db.query("reports").collect();

    return {
      users: users.length,
      workspaces: workspaces.length,
      projects: projects.length,
      workspaceUsers: workspaceUsers.length,
      workspaceProjects: workspaceProjects.length,
      documents: documents.length,
      reports: reports.length,
    };
  },
});
