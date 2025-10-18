# API Callbacks

Callbacks allow you to extend the module's functionality with cascade deletion of related data.

## `onWorkspaceDelete` Callback

Called when a workspace is deleted. Use for cascade deletion of related data:

```typescript
onWorkspaceDelete: async (ctx, workspaceId) => {
  // Delete all workspace files
  const files = await ctx.db
    .query("files")
    .withIndex("by_workspace", (q) => q.eq("workspaceId", workspaceId))
    .collect();

  await Promise.all(files.map(file => ctx.db.delete(file._id)));

  // Delete all workspace settings
  const settings = await ctx.db
    .query("workspaceSettings")
    .withIndex("by_workspace", (q) => q.eq("workspaceId", workspaceId))
    .collect();

  await Promise.all(settings.map(setting => ctx.db.delete(setting._id)));
}
```

## `onProjectDelete` Callback

Called when a project is deleted. Use for cascade deletion of related data:

```typescript
onProjectDelete: async (ctx, projectId) => {
  // Delete all project documents
  const documents = await ctx.db
    .query("documents")
    .withIndex("by_project", (q) => q.eq("projectId", projectId))
    .collect();

  await Promise.all(documents.map(doc => ctx.db.delete(doc._id)));

  // Delete all project comments
  const comments = await ctx.db
    .query("comments")
    .withIndex("by_project", (q) => q.eq("projectId", projectId))
    .collect();

  await Promise.all(comments.map(comment => ctx.db.delete(comment._id)));

  // Delete all project files
  const files = await ctx.db
    .query("files")
    .withIndex("by_project", (q) => q.eq("projectId", projectId))
    .collect();

  await Promise.all(files.map(file => ctx.storage.delete(file._id)));
}
```

