import { mutation } from "../_generated/server";

export const clear = mutation({
  args: {},
  handler: async (ctx) => {
    const entityAccess = await ctx.db.query("entityAccess").collect();
    for (const item of entityAccess) {
      await ctx.db.delete(item._id);
    }

    const memberships = await ctx.db.query("memberships").collect();
    for (const item of memberships) {
      await ctx.db.delete(item._id);
    }

    const documents = await ctx.db.query("documents").collect();
    for (const item of documents) {
      await ctx.db.delete(item._id);
    }

    const tasks = await ctx.db.query("tasks").collect();
    for (const item of tasks) {
      await ctx.db.delete(item._id);
    }

    const entities = await ctx.db.query("entities").collect();
    for (const item of entities) {
      await ctx.db.delete(item._id);
    }

    const workspaces = await ctx.db.query("workspaces").collect();
    for (const item of workspaces) {
      await ctx.db.delete(item._id);
    }

    const users = await ctx.db.query("users").collect();
    for (const item of users) {
      await ctx.db.delete(item._id);
    }
  },
});
