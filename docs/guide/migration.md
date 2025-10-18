# Migrating Existing Users

If you already have users, add the `defaultDataInitialized` field and create personal workspaces for them:

```typescript
// In convex/migrations.ts or a separate migration file
import { mutation } from "./_generated/server";
import { initializePersonalWorkspace } from "convex-workspaces";

export const migrateExistingUsers = mutation({
  args: {},
  handler: async (ctx) => {
    const users = await ctx.db.query("users").collect();
    
    for (const user of users) {
      // Add defaultDataInitialized field if it doesn't exist
      if (user.defaultDataInitialized === undefined) {
        await ctx.db.patch(user._id, {
          defaultDataInitialized: false,
        });
      }

      // Check if user has a personal workspace
      const personalWorkspace = await ctx.db
        .query("workspaces")
        .withIndex("by_owner_personal", (q) => 
          q.eq("ownerId", user._id).eq("personal", true)
        )
        .first();

      // Create personal workspace if it doesn't exist
      if (!personalWorkspace) {
        await initializePersonalWorkspace(ctx, user._id, `${user.name || "User"}'s Personal Workspace`);
      }

      // Mark user data as initialized
      await ctx.db.patch(user._id, {
        defaultDataInitialized: true,
      });
    }
  },
});
```

