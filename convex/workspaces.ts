import { convexWorkspaces } from "../src/index";

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
      // Удаляем все документы и задачи, связанные с удаленными entities
      for (const entityId of entityIds) {
        // Удаляем документы
        const documents = await ctx.db
          .query("documents")
          .withIndex("by_entity", (q) => q.eq("entityId", entityId))
          .collect();
        
        for (const document of documents) {
          await ctx.db.delete(document._id as any);
        }

        // Удаляем задачи
        const tasks = await ctx.db
          .query("tasks")
          .withIndex("by_entity", (q) => q.eq("entityId", entityId))
          .collect();
        
        for (const task of tasks) {
          await ctx.db.delete(task._id as any);
        }
      }
    },
    onEntityRemoved: async (ctx, { entityId }) => {
      // Удаляем все документы и задачи, связанные с удаленной entity
      const documents = await ctx.db
        .query("documents")
        .withIndex("by_entity", (q) => q.eq("entityId", entityId))
        .collect();
      
      for (const document of documents) {
        await ctx.db.delete(document._id as any);
      }

      const tasks = await ctx.db
        .query("tasks")
        .withIndex("by_entity", (q) => q.eq("entityId", entityId))
        .collect();
      
      for (const task of tasks) {
        await ctx.db.delete(task._id as any);
      }
    },
  },
});
