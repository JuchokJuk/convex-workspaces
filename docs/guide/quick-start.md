# Quick Start

Get up and running with Convex Workspaces in minutes.

## Installation

```bash
npm install convex-workspaces
```

## Basic Setup

### 1. Add to your Convex schema

```typescript
// convex/schema.ts
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { workspacesTables } from "convex-workspaces";
import { authTables } from "@convex-dev/auth/server";

export default defineSchema({
  ...authTables,           // Required for authentication
  ...workspacesTables,     // Add workspace tables
  
  // Extend users table with additional fields
  users: defineTable({
    name: v.optional(v.string()),
    image: v.optional(v.string()),
    email: v.optional(v.string()),
    emailVerificationTime: v.optional(v.number()),
    phone: v.optional(v.string()),
    phoneVerificationTime: v.optional(v.number()),
    isAnonymous: v.optional(v.boolean()),
    defaultDataInitialized: v.optional(v.boolean()),
  })
    .index("email", ["email"])
    .index("phone", ["phone"]),
    
  // Your existing tables
});
```

### 2. Initialize authentication with convex-auth

```typescript
// convex/auth.ts
import { convexAuth } from "@convex-dev/auth/server";
import { setDefaultUserData } from "./setDefaultUserData";
import { Anonymous } from "@convex-dev/auth/providers/Anonymous";

export const { auth, signIn, signOut, store, isAuthenticated } = convexAuth({
  providers: [Anonymous], // Add your auth providers
  callbacks: {
    afterUserCreatedOrUpdated: setDefaultUserData, // Required for personal workspaces
  },
});
```

### 3. Create user initialization callback

```typescript
// convex/setDefaultUserData.ts
import { MutationCtx } from "./_generated/server";
import { Id } from "./_generated/dataModel";
import { initializePersonalWorkspace } from "convex-workspaces";

export async function setDefaultUserData(
  ctx: MutationCtx,
  { userId }: { userId: Id<"users"> },
) {
  const user = await ctx.db.get(userId);
  if (user?.defaultDataInitialized) return;

  // Create personal workspace automatically
  await initializePersonalWorkspace(
    ctx, 
    userId, 
    `${user?.name || "User"}'s Personal Workspace`
  );

  await ctx.db.patch(userId, { defaultDataInitialized: true });
}
```

### 4. Initialize convex-workspaces with callbacks

```typescript
// convex/workspaces.ts
import { convexWorkspaces } from "convex-workspaces";

export const {
  // Workspaces
  createWorkspace,
  updateWorkspace,
  removeWorkspace,
  getWorkspaceById,
  getWorkspacesByOwner,
  getPersonalWorkspace,
  getUserWorkspaces,

  // Memberships
  createMembership,
  updateMembershipRole,
  removeMembership,
  removeUserFromWorkspace,
  getMembershipByWorkspaceAndUser,
  getMembershipsByWorkspace,
  getMembershipsByUser,
  getCurrentUserMembership,

  // Entities
  createEntity,
  removeEntity,
  getEntityById,
  getEntitiesByWorkspace,
  checkEntityAccess,
  getUserAccessibleEntities,

  // Entity Access
  createEntityAccess,
  updateEntityAccessLevel,
  removeEntityAccess,
  getEntityAccessByEntityAndWorkspace,
  getEntityAccessByEntity,
  getEntityAccessByWorkspace,
  getUserEffectiveAccess,

  // Permissions
  checkUserPermission,
  checkEntityPermission,
  getUserRoleInWorkspace,
  getUserRoleForEntity,
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