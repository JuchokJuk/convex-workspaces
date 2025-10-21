# API Callbacks

Callbacks allow you to define custom cleanup logic when workspaces or entities are deleted.

## Configuration

```typescript
// convex/workspaces.ts
import { convexWorkspaces } from "convex-workspaces";

export const {
  createWorkspace,
  removeWorkspace,
  createEntity,
  removeEntity,
  // ... other functions
} = convexWorkspaces({
  callbacks: {
    onWorkspaceRemoved: async (ctx, { entityIds }) => {
      // Your cleanup logic here
    },
    onEntityRemoved: async (ctx, { entityId }) => {
      // Your cleanup logic here
    },
  },
});
```

## Available Callbacks

### `onWorkspaceRemoved`
- **Parameters:** `{ entityIds: string[] }` - All entity IDs that were in the deleted workspace
- **Triggered:** When a workspace is deleted

### `onEntityRemoved`
- **Parameters:** `{ entityId: string }` - The ID of the deleted entity
- **Triggered:** When an entity is deleted