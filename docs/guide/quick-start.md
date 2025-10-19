# Quick Start

## What This Module Does

This module adds **multi-user collaboration** to your Convex app:

- **Workspaces**: Groups where users can collaborate (like "Marketing Team" or "Project Alpha")
- **Role-based Access**: Admin can invite users, editors can modify data, viewers can only read
- **Sharing System**: Share entities between workspaces with proper permissions
- **Personal Workspaces**: Every user gets their own private space automatically

Think of it as **"Convex Auth + Team Collaboration"** - it extends your existing Convex app with multi-user features.

## Installation

```bash
npm install convex-workspaces
```

[![NPM](https://nodei.co/npm/convex-workspaces.png)](https://www.npmjs.com/package/convex-workspaces)

## Minimum Requirements for Integration

### 1. Extend User Table

Add the `defaultDataInitialized` field to your user schema in `convex/users/schema.ts`:

```typescript
import { defineTable } from "convex/server";
import { v } from "convex/values";

export const users = defineTable({
  name: v.optional(v.string()),
  image: v.optional(v.string()),
  email: v.optional(v.string()),
  emailVerificationTime: v.optional(v.number()),
  phone: v.optional(v.string()),
  phoneVerificationTime: v.optional(v.number()),
  isAnonymous: v.optional(v.boolean()),
  defaultDataInitialized: v.optional(v.boolean()), // Add this field
})
  .index("email", ["email"])
  .index("phone", ["phone"]);
```

### 2. Update Main Schema

In `convex/schema.ts`, import the workspace schema and your user table:

```typescript
import { defineSchema } from "convex/server";
import { authTables } from "@convex-dev/auth/server";
import { workspacesSchema } from "convex-workspaces";
import { users } from "./users/schema"; // Import your user schema

export default defineSchema({
  ...authTables,
  users, // Add your user table
  ...workspacesSchema,
  // Your other tables...
});
```

### 3. Configure Auth Callback

In `convex/auth.ts`, use the `initializePersonalWorkspace` function to create a personal workspace:

```typescript
import { convexAuth } from "@convex-dev/auth/server";
import { initializePersonalWorkspace } from "convex-workspaces";

export const { auth, signIn, signOut, store } = convexAuth({
  callbacks: {
    afterUserCreatedOrUpdated: async (ctx, args) => {
      const userId = args.userId;
      
      // Check if user data is already initialized
      const user = await ctx.db.get(userId);
      if (user?.defaultDataInitialized) {
        return; // Data already initialized
      }

      // Create personal workspace using the utility
      await initializePersonalWorkspace(ctx, userId, "My Workspace");

      // Mark user data as initialized
      await ctx.db.patch(userId, {
        defaultDataInitialized: true,
      });
    },
  },
});
```

### Why is `defaultDataInitialized` field needed?

The `defaultDataInitialized` field in the user table prevents **duplicate personal workspaces**:

- **Problem**: Convex Auth may call `afterUserCreatedOrUpdated` multiple times for the same user
- **Solution**: Check `defaultDataInitialized` before creating a personal workspace
- **Result**: Each user gets exactly one personal workspace

### Personal Workspace Requirement

**Important**: Every user must have a personal workspace. If a personal workspace is missing, the module will throw an error:

```
"Personal workspace not found. Every user must have a personal workspace. 
Ensure that you call initializePersonalWorkspace() in your afterUserCreatedOrUpdated 
callback to create the required personal workspace."
```

This ensures all module functions work correctly.

### 4. Initialize Workspace Functions

Create `convex/workspaces.ts`:

```typescript
import { convexWorkspaces } from "convex-workspaces";
import { Id } from "./_generated/dataModel";

// Export all workspace functions
export const {
  // Workspace mutations
  createWorkspace,
  addUserToWorkspace,
  deleteWorkspace,

  // Project mutations
  createProject,
  shareProject,
  deleteProject,

  // Workspace queries
  getPersonalWorkspace,
  getUserWorkspaces,
  getWorkspace,
  getWorkspaceRole,

  // Project queries
  getProject,
  getUserProjectsWithRoles,
  getProjectRole,
  canEditProject,
  canDeleteProject,
} = convexWorkspaces({
  callbacks: {
    // Optional callbacks for cascade deletion
    onWorkspaceDelete: async (ctx, workspaceId) => {
      // Delete related data when workspace is deleted
    },
    onProjectDelete: async (ctx, projectId) => {
      // Delete related data when project is deleted
    },
  },
});
```