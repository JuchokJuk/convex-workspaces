# Usage Examples

## Document Collaboration

```typescript
// Create workspace for project
const workspaceId = await ctx.runMutation(api.workspaces.createWorkspace, {
  name: "Project Alpha",
  personal: false,
});

// Create entity for documents
const entityId = await ctx.runMutation(api.workspaces.createEntity, {
  workspaceId,
});

// Create document
const documentId = await ctx.runMutation(api.documents.create, {
  entityId,
  title: "Project Overview",
  content: "# Project Alpha",
});
```

## Task Management

```typescript
// Create workspace for sprint
const workspaceId = await ctx.runMutation(api.workspaces.createWorkspace, {
  name: "Sprint 23",
  personal: false,
});

// Create entity for tasks
const entityId = await ctx.runMutation(api.workspaces.createEntity, {
  workspaceId,
});

// Create task
const taskId = await ctx.runMutation(api.tasks.create, {
  entityId,
  title: "Implement auth",
  status: "todo",
});
```

## Entity Sharing

```typescript
// Share documents with design team
await ctx.runMutation(api.workspaces.createEntityAccess, {
  workspaceId: designWorkspaceId,
  entityId: documentsEntityId,
  accessLevel: "editor",
});

// Share tasks with QA team (view-only)
await ctx.runMutation(api.workspaces.createEntityAccess, {
  workspaceId: qaWorkspaceId,
  entityId: tasksEntityId,
  accessLevel: "viewer",
});
```

## Multi-tenant SaaS

```typescript
// Each customer gets their own workspace
const customerWorkspaceId = await ctx.runMutation(api.workspaces.createWorkspace, {
  name: `${customerName} - Portal`,
  personal: false,
});

// Separate entities for different data types
const customersEntityId = await ctx.runMutation(api.workspaces.createEntity, {
  workspaceId: customerWorkspaceId,
});

const invoicesEntityId = await ctx.runMutation(api.workspaces.createEntity, {
  workspaceId: customerWorkspaceId,
});

// Internal teams can access customer data
await ctx.runMutation(api.workspaces.createEntityAccess, {
  workspaceId: salesWorkspaceId,
  entityId: customersEntityId,
  accessLevel: "editor",
});
```