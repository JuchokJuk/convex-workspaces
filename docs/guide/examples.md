# Usage Examples

## Creating a Team Workspace

```typescript
const createTeamWorkspace = async () => {
  const workspaceId = await ctx.runMutation(api.workspaces.createWorkspace, {
    name: "Development Team",
    personal: false,
  });
  
  console.log("Created workspace:", workspaceId);
};
```

## Inviting a User to Workspace

```typescript
const inviteUser = async (workspaceId: Id<"workspaces">, userId: Id<"users">) => {
  await ctx.runMutation(api.workspaces.addUserToWorkspace, {
    workspaceId,
    targetUserId: userId,
    userRole: "editor", // or "viewer", "admin"
  });
};
```

## Creating a Project

```typescript
const createNewProject = async (workspaceId: Id<"workspaces">) => {
  const projectId = await ctx.runMutation(api.workspaces.createProject, {
    workspaceId,
    name: "My New Project",
    description: "Project description",
  });
  
  return projectId;
};
```

## Sharing a Project

```typescript
const shareProjectWithUser = async (
  sourceWorkspaceId: Id<"workspaces">,
  projectId: Id<"projects">,
  targetUserId: Id<"users">
) => {
  await ctx.runMutation(api.workspaces.shareProject, {
    sourceWorkspaceId,
    projectId,
    targetUserId,
    targetUserRole: "viewer", // Role will be limited by sender's role
  });
};
```

## Getting User's Project List

```typescript
const getUserProjects = async () => {
  return await ctx.runQuery(api.workspaces.getUserProjectsWithRoles);
};

// Returns an array of objects:
// [
//   {
//     project: { _id: "...", name: "...", description: "..." },
//     workspace: { _id: "...", name: "...", personal: true },
//     role: "admin" | "editor" | "viewer"
//   }
// ]
```

