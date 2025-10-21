# Usage Examples

Learn how to implement CRUD operations with proper workspace and entity access control using handler calls.

## CRUD Pattern for Sharable Entities

### Document Management System

```typescript
// convex/documents/mutations.ts
import { mutation } from "../_generated/server";
import { v } from "convex/values";
import { requireAuth } from "../utils/requireAuth";
import { workspaces } from "../workspaces";
import { checkEntityAccess, checkWritePermission } from "../utils/accessControl";

// Create document with new entity
export const createDocument = mutation({
  args: {
    workspaceId: v.id("workspaces"),
    title: v.string(),
    content: v.string(),
  },
  handler: async (ctx, args) => {
    await requireAuth(ctx);

    // Create entity in workspace
    const entityId = (await workspaces.createEntityHandler(ctx, {
      workspaceId: args.workspaceId,
    })) as Id<"entities">;

    // Create document
    const documentId = await ctx.db.insert("documents", {
      entityId,
      title: args.title,
      content: args.content,
    });

    return { entityId, documentId };
  },
});

// Create document for existing entity
export const createDocumentForEntity = mutation({
  args: {
    entityId: v.id("entities"),
    title: v.string(),
    content: v.string(),
  },
  handler: async (ctx, args) => {
    await requireAuth(ctx);

    // Check access to entity
    const { membership } = await checkEntityAccess(ctx, args.entityId);
    checkWritePermission(membership);

    // Create document
    const documentId = await ctx.db.insert("documents", {
      entityId: args.entityId,
      title: args.title,
      content: args.content,
    });

    return documentId;
  },
});

// Update document
export const updateDocument = mutation({
  args: {
    documentId: v.id("documents"),
    title: v.optional(v.string()),
    content: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await requireAuth(ctx);

    const document = await ctx.db.get(args.documentId);
    if (!document) throw new Error("Document not found");

    // Check access to entity
    await checkEntityAccess(ctx, document.entityId);

    const { documentId, ...updates } = args;
    await ctx.db.patch(documentId, updates);
  },
});

// Delete document
export const removeDocument = mutation({
  args: {
    documentId: v.id("documents"),
  },
  handler: async (ctx, args) => {
    await requireAuth(ctx);

    const document = await ctx.db.get(args.documentId);
    if (!document) throw new Error("Document not found");

    // Check access to entity
    await checkEntityAccess(ctx, document.entityId);

    await ctx.db.delete(args.documentId);
  },
});

// Share document with workspace
export const shareDocumentWithWorkspace = mutation({
  args: {
    documentId: v.id("documents"),
    targetWorkspaceId: v.id("workspaces"),
    accessLevel: v.union(
      v.literal("admin"),
      v.literal("editor"),
      v.literal("viewer")
    ),
  },
  handler: async (ctx, args) => {
    await requireAuth(ctx);

    const document = await ctx.db.get(args.documentId);
    if (!document) throw new Error("Document not found");

    // Check access to source entity
    await checkEntityAccess(ctx, document.entityId);

    // Share entity with target workspace
    const result = (await workspaces.createEntityAccessHandler(ctx, {
      workspaceId: args.targetWorkspaceId,
      entityId: document.entityId,
      accessLevel: args.accessLevel,
    })) as Id<"entityAccess">;

    return result;
  },
});

// Share document with user (automatically finds their personal workspace)
export const shareDocumentWithUser = mutation({
  args: {
    documentId: v.id("documents"),
    targetUserId: v.id("users"),
    accessLevel: v.union(
      v.literal("admin"),
      v.literal("editor"),
      v.literal("viewer")
    ),
  },
  handler: async (ctx, args) => {
    await requireAuth(ctx);

    const document = await ctx.db.get(args.documentId);
    if (!document) throw new Error("Document not found");

    // Check access to source entity
    await checkEntityAccess(ctx, document.entityId);

    // Get target user's personal workspace
    const personalWorkspace = await workspaces.getPersonalWorkspaceByUserIdHandler(ctx, {
      userId: args.targetUserId,
    });
    
    if (!personalWorkspace) throw new Error("Personal workspace not found");

    // Share entity with personal workspace
    const result = (await workspaces.createEntityAccessHandler(ctx, {
      workspaceId: personalWorkspace._id,
      entityId: document.entityId,
      accessLevel: args.accessLevel,
    })) as Id<"entityAccess">;

    return result;
  },
});
```

### Queries with Access Control

```typescript
// convex/documents/queries.ts
import { query } from "../_generated/server";
import { v } from "convex/values";
import { requireAuth } from "../utils/requireAuth";
import { workspaces } from "../workspaces";
import { checkEntityAccess } from "../utils/accessControl";

// Get document by ID
export const getDocumentById = query({
  args: {
    documentId: v.id("documents"),
  },
  handler: async (ctx, args) => {
    await requireAuth(ctx);

    const document = await ctx.db.get(args.documentId);
    if (!document) return null;

    // Check access to entity
    await checkEntityAccess(ctx, document.entityId);

    return document;
  },
});

// Get documents by entity
export const getDocumentsByEntity = query({
  args: {
    entityId: v.id("entities"),
  },
  handler: async (ctx, args) => {
    await requireAuth(ctx);

    // Check access to entity
    await checkEntityAccess(ctx, args.entityId);

    return await ctx.db
      .query("documents")
      .withIndex("by_entity", (q) => q.eq("entityId", args.entityId))
      .collect();
  },
});

// Get all documents accessible to user
export const getUserAccessibleDocuments = query({
  args: {},
  handler: async (ctx, args) => {
    await requireAuth(ctx);

    // Get all accessible entities
    const accessibleEntities = await workspaces.getUserAccessibleEntitiesHandler(ctx);

    const documents: {
      _id: Id<"documents">;
      _creationTime: number;
      entityId: Id<"entities">;
      title: string;
      content: string;
      userRole: string;
      workspaceId: Id<"workspaces">;
    }[] = [];

    for (const entity of accessibleEntities) {
      const entityDocuments = await ctx.db
        .query("documents")
        .withIndex("by_entity", (q) => q.eq("entityId", entity._id))
        .collect();

      for (const document of entityDocuments) {
        documents.push({
          ...document,
          userRole: entity.userRole,
          workspaceId: entity.workspaceId,
        });
      }
    }

    return documents;
  },
});

// Get documents by workspace
export const getDocumentsByWorkspace = query({
  args: {
    workspaceId: v.id("workspaces"),
  },
  handler: async (ctx, args) => {
    await requireAuth(ctx);

    // Check workspace membership
    const membership = await workspaces.getCurrentUserMembershipHandler(ctx, {
      workspaceId: args.workspaceId,
    });
    if (!membership) throw new Error("Access denied");

    // Get all entities in workspace
    const entities = await workspaces.getEntitiesByWorkspaceHandler(ctx, {
      workspaceId: args.workspaceId,
    });

    const documents = [];
    for (const entity of entities) {
      const entityDocuments = await ctx.db
        .query("documents")
        .withIndex("by_entity", (q) => q.eq("entityId", entity._id))
        .collect();
      
      documents.push(...entityDocuments);
    }

    return documents;
  },
});
```

## Key Patterns

### 1. Workspace Functions
Use workspace functions to interact with the system:

```typescript
const entityId = await workspaces.createEntityHandler(ctx, {
  workspaceId: args.workspaceId,
});

const access = await workspaces.getUserEffectiveAccessHandler(ctx, {
  entityId,
});
```

### 2. Access Control Utilities
Use access control functions for consistent security:

```typescript
// Check entity access (works for both workspace members and shared entities)
await checkEntityAccess(ctx, entityId);

// Check write permissions
const { membership } = await checkEntityAccess(ctx, entityId);
checkWritePermission(membership);
```

### 3. Personal Workspace Discovery
When sharing with users, find their personal workspace automatically:

```typescript
const personalWorkspace = await workspaces.getPersonalWorkspaceByUserIdHandler(ctx, {
  userId: targetUserId,
});
```

## Utility Functions Reference

Here are the key utility functions used in the examples:

### Access Control Utilities

```typescript
// convex/utils/accessControl.ts
import { Doc, Id } from "../_generated/dataModel";
import { workspaces } from "../workspaces";
import { MutationCtx, QueryCtx } from "../_generated/server";

export interface EntityAccessResult {
  entity: Doc<"entities">;
  membership: Doc<"memberships"> | null;
  effectiveAccess: string | null;
}

/**
 * Checks access to entity through workspace membership or shared access
 */
export async function checkEntityAccess(
  ctx: QueryCtx | MutationCtx,
  entityId: Id<"entities">
): Promise<EntityAccessResult> {
  const entity = (await ctx.db.get(entityId)) as Doc<"entities">;
  if (!entity) throw new Error("Entity not found");

  const membership = (await workspaces.getCurrentUserMembershipHandler(ctx, {
    workspaceId: entity.workspaceId as Id<"workspaces">,
  })) as Doc<"memberships"> | null;

  let effectiveAccess: string | null = null;
  if (!membership) {
    // Check access through shared entity
    effectiveAccess = await workspaces.getUserEffectiveAccessHandler(ctx, {
      entityId,
    });
    if (!effectiveAccess) throw new Error("Access denied");
  }

  return { entity, membership, effectiveAccess };
}

/**
 * Checks write permissions (not viewer)
 */
export function checkWritePermission(
  membership: Doc<"memberships"> | null
): void {
  if (membership?.userRole === "viewer") {
    throw new Error("Insufficient permissions");
  }
}
```

### Workspace Functions

```typescript
// Key functions from workspaces module:

// Entity management
workspaces.createEntityHandler(ctx, { workspaceId })
workspaces.getEntityByIdHandler(ctx, { entityId })
workspaces.getEntitiesByWorkspaceHandler(ctx, { workspaceId })
workspaces.removeEntityHandler(ctx, { entityId })

// Access control
workspaces.getCurrentUserMembershipHandler(ctx, { workspaceId })
workspaces.getUserEffectiveAccessHandler(ctx, { entityId })
workspaces.getUserAccessibleEntitiesHandler(ctx)

// Entity sharing
workspaces.createEntityAccessHandler(ctx, { workspaceId, entityId, accessLevel })
workspaces.removeEntityAccessHandler(ctx, { accessId })

// Personal workspace discovery
workspaces.getPersonalWorkspaceByUserIdHandler(ctx, { userId })
```

These functions are available as raw handlers and as full queries and mutations in your Convex application.
