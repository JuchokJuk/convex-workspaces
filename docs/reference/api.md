# API Reference

## Workspace Management

### `createWorkspace`
```typescript
const workspaceId = await ctx.runMutation(api.workspaces.createWorkspace, {
  name: string,
  personal: boolean,
});
```

### `removeWorkspace`
```typescript
await ctx.runMutation(api.workspaces.removeWorkspace, {
  workspaceId: Id<"workspaces">,
});
```

### `getPersonalWorkspace`
```typescript
const personalWorkspace = await ctx.runQuery(api.workspaces.getPersonalWorkspace, {});
```

## Membership Management

### `createMembership`
```typescript
const membershipId = await ctx.runMutation(api.workspaces.createMembership, {
  workspaceId: Id<"workspaces">,
  userId: Id<"users">,
  userRole: "admin" | "editor" | "viewer",
});
```

### `updateMembership`
```typescript
await ctx.runMutation(api.workspaces.updateMembership, {
  membershipId: Id<"memberships">,
  userRole: "admin" | "editor" | "viewer",
});
```

### `removeMembership`
```typescript
await ctx.runMutation(api.workspaces.removeMembership, {
  membershipId: Id<"memberships">,
});
```

## Entity Management

### `createEntity`
```typescript
const entityId = await ctx.runMutation(api.workspaces.createEntity, {
  workspaceId: Id<"workspaces">,
});
```

### `removeEntity`
```typescript
await ctx.runMutation(api.workspaces.removeEntity, {
  entityId: Id<"entities">,
});
```

## Entity Sharing

### `createEntityAccess`
```typescript
const accessId = await ctx.runMutation(api.workspaces.createEntityAccess, {
  workspaceId: Id<"workspaces">,
  entityId: Id<"entities">,
  accessLevel: "admin" | "editor" | "viewer",
});
```

### `updateEntityAccessLevel`
```typescript
await ctx.runMutation(api.workspaces.updateEntityAccessLevel, {
  accessId: Id<"entityAccess">,
  accessLevel: "admin" | "editor" | "viewer",
});
```

### `removeEntityAccess`
```typescript
await ctx.runMutation(api.workspaces.removeEntityAccess, {
  accessId: Id<"entityAccess">,
});
```

## Permission Checks

### `checkEntityAccess`
```typescript
const hasAccess = await ctx.runQuery(api.workspaces.checkEntityAccess, {
  entityId: Id<"entities">,
  userId: Id<"users">,
});
```

### `checkUserPermission`
```typescript
const hasPermission = await ctx.runQuery(api.workspaces.checkUserPermission, {
  workspaceId: Id<"workspaces">,
  targetUserId: Id<"users">,
  requiredRole: "admin" | "editor" | "viewer",
});
```

## Role Hierarchy
- **Admin** (3) - Full access
- **Editor** (2) - Can create and modify data
- **Viewer** (1) - Read-only access
