# Usage Examples

Learn how to implement CRUD operations with proper workspace and entity access control.

## Document Management System

### Ready-to-Use Actions (Recommended)

```typescript
// convex/documents/actions.ts
import { action } from "../_generated/server";
import { v } from "convex/values";
import { api } from "../_generated/api";
import { requireAuth } from "../utils/requireAuth";

export const createDocument = action({
  args: {
    workspaceId: v.id("workspaces"),
    title: v.string(),
    content: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await requireAuth(ctx);

    // Check workspace access
    const membership = await ctx.runQuery(
      api.workspaces.getCurrentUserMembership,
      { workspaceId: args.workspaceId }
    );
    if (!membership) throw new Error("Access denied");
    if (membership.userRole === "viewer") throw new Error("Insufficient permissions");

    // Automatically create entity and document
    const entityId = await ctx.runMutation(api.workspaces.createEntity, {
      workspaceId: args.workspaceId,
    });

    const documentId = await ctx.runMutation(api.documents.createDocument, {
      entityId,
      title: args.title,
      content: args.content,
      authorId: userId,
    });

    return { entityId, documentId };
  },
});

export const updateDocument = action({
  args: {
    documentId: v.id("documents"),
    title: v.optional(v.string()),
    content: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await requireAuth(ctx);

    const document = await ctx.runQuery(api.documents.getDocumentById, {
      documentId: args.documentId,
    });
    if (!document) throw new Error("Document not found");

    // Check access through entity
    const entity = await ctx.runQuery(api.workspaces.getEntityById, {
      entityId: document.entityId,
    });
    if (!entity) throw new Error("Entity not found");

    const membership = await ctx.runQuery(
      api.workspaces.getCurrentUserMembership,
      { workspaceId: entity.workspaceId }
    );
    if (!membership) throw new Error("Access denied");
    if (membership.userRole === "viewer") throw new Error("Insufficient permissions");

    await ctx.runMutation(api.documents.updateDocument, {
      documentId: args.documentId,
      title: args.title,
      content: args.content,
    });
  },
});

export const deleteDocument = action({
  args: { documentId: v.id("documents") },
  handler: async (ctx, args) => {
    const userId = await requireAuth(ctx);

    const document = await ctx.runQuery(api.documents.getDocumentById, {
      documentId: args.documentId,
    });
    if (!document) throw new Error("Document not found");

    // Check access through entity
    const entity = await ctx.runQuery(api.workspaces.getEntityById, {
      entityId: document.entityId,
    });
    if (!entity) throw new Error("Entity not found");

    const membership = await ctx.runQuery(
      api.workspaces.getCurrentUserMembership,
      { workspaceId: entity.workspaceId }
    );
    if (!membership) throw new Error("Access denied");
    if (membership.userRole === "viewer") throw new Error("Insufficient permissions");

    await ctx.runMutation(api.documents.deleteDocument, {
      documentId: args.documentId,
    });
  },
});
```

### Queries with Access Control

```typescript
// convex/documents/queries.ts
import { query } from "../_generated/server";
import { v } from "convex/values";
import { api } from "../_generated/api";
import { requireAuth } from "../utils/requireAuth";

export const getDocumentsByEntity = query({
  args: { entityId: v.id("entities") },
  handler: async (ctx, args) => {
    const userId = await requireAuth(ctx);

    // Check access to entity
    const entity = await ctx.db.get(args.entityId);
    if (!entity) throw new Error("Entity not found");

    const membership = await ctx.runQuery(
      api.workspaces.getCurrentUserMembership,
      { workspaceId: entity.workspaceId }
    );
    if (!membership) throw new Error("Access denied");

    return await ctx.db
      .query("documents")
      .withIndex("by_entity", (q) => q.eq("entityId", args.entityId))
      .collect();
  },
});

export const getUserAccessibleDocuments = query({
  args: {},
  handler: async (ctx) => {
    const userId = await requireAuth(ctx);

    // Get all entities accessible to user
    const accessibleEntities = await ctx.runQuery(
      api.workspaces.getUserAccessibleEntities,
      {}
    );

    const documents = [];
    for (const entity of accessibleEntities) {
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

## Entity Sharing Implementation

### Share Documents Between Workspaces

```typescript
// convex/documents/actions.ts
import { action } from "../_generated/server";
import { v } from "convex/values";
import { api } from "../_generated/api";
import { requireAuth } from "../utils/requireAuth";

export const shareDocumentWithWorkspace = action({
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
    const userId = await requireAuth(ctx);

    const document = await ctx.db.get(args.documentId);
    if (!document) throw new Error("Document not found");

    // Check if user can share this document
    const entity = await ctx.db.get(document.entityId);
    if (!entity) throw new Error("Entity not found");

    const membership = await ctx.runQuery(
      api.workspaces.getCurrentUserMembership,
      { workspaceId: entity.workspaceId }
    );
    if (!membership) throw new Error("Access denied");
    if (membership.userRole !== "admin") throw new Error("Only admins can share entities");

    // Share the entity with target workspace
    return await ctx.runMutation(api.workspaces.createEntityAccess, {
      workspaceId: args.targetWorkspaceId,
      entityId: document.entityId,
      accessLevel: args.accessLevel,
    });
  },
});
```

## Key Patterns

### 1. Use Actions for Ready-to-Use CRUD
Actions automatically handle entity creation and hide technical complexity:

```typescript
// ✅ User-friendly API
const { entityId, documentId } = await ctx.runAction(api.documents.createDocument, {
  workspaceId: "workspace123",
  title: "My Document",
  content: "Content here",
});

// ❌ Technical complexity exposed
const entityId = await ctx.runMutation(api.workspaces.createEntity, {
  workspaceId: "workspace123",
});
const documentId = await ctx.runMutation(api.documents.createDocument, {
  entityId,
  title: "My Document",
  content: "Content here",
});
```

### 2. Always Check Workspace Access
Verify user has access to the workspace before creating resources:

```typescript
const membership = await ctx.runQuery(
  api.workspaces.getCurrentUserMembership,
  { workspaceId: args.workspaceId }
);
if (!membership) throw new Error("Access denied");
if (membership.userRole === "viewer") throw new Error("Insufficient permissions");
```

### 3. Why Actions Instead of Mutations?
- **Actions can call multiple mutations** - create entity + create document in one call
- **Hide technical details** - user doesn't need to know about entities
- **Better UX** - one API call instead of two
- **Atomic operations** - if entity creation fails, document creation won't happen