import { describe, it, expect, beforeEach } from "vitest";
import dotenv from "dotenv";
import { ConvexHttpClient } from "convex/browser";
import { api } from "../convex/_generated/api.js";
import { clearDatabase } from "./utils/clearDatabase.js";
import { createSignedClient } from "./utils/createSignedClient.js";

dotenv.config({ path: ".env.local" });

const convexUrl = process.env.CONVEX_URL!;

describe("Convex Workspaces - Security Functions Tests", () => {
  let ownerClient: ConvexHttpClient;
  let memberClient: ConvexHttpClient;
  let outsiderClient: ConvexHttpClient;

  beforeEach(async () => {
    await clearDatabase();
    ownerClient = await createSignedClient();
    memberClient = await createSignedClient();
    outsiderClient = await createSignedClient();
  });

  describe("checkEntityAccess Security", () => {
    it("should allow checking entity access within own workspace", async () => {
      // Owner создает воркспейс и entity
      const workspaceId = await ownerClient.mutation(api.workspaces.createWorkspace, {
        name: "Test Workspace",
        personal: false,
      });

      const entityId = await ownerClient.mutation(api.workspaces.createEntity, {
        workspaceId,
      });

      // Owner приглашает member в воркспейс
      const memberPersonalWorkspace = await memberClient.query(api.workspaces.getPersonalWorkspace, {});
      const memberUserId = memberPersonalWorkspace?.ownerId || "";

      await ownerClient.mutation(api.workspaces.createMembership, {
        workspaceId,
        userId: memberUserId as any,
        userRole: "editor",
      });

      // Owner может проверить доступ member к entity в своем воркспейсе
      const hasAccess = await ownerClient.query(api.workspaces.checkEntityAccess, {
        entityId,
        userId: memberUserId as any,
      });

      expect(hasAccess).toBe(true);
    });

    it("should not allow checking entity access outside own workspace", async () => {
      // Owner создает воркспейс и entity
      const workspaceId = await ownerClient.mutation(api.workspaces.createWorkspace, {
        name: "Owner Workspace",
        personal: false,
      });

      const entityId = await ownerClient.mutation(api.workspaces.createEntity, {
        workspaceId,
      });

      // Outsider пытается проверить доступ к entity в чужом воркспейсе
      const outsiderPersonalWorkspace = await outsiderClient.query(api.workspaces.getPersonalWorkspace, {});
      const outsiderUserId = outsiderPersonalWorkspace?.ownerId || "";

      await expect(
        outsiderClient.query(api.workspaces.checkEntityAccess, {
          entityId,
          userId: outsiderUserId as any,
        })
      ).rejects.toThrow("Access denied - you are not a member of this workspace");
    });

    it("should allow checking entity access for shared entities", async () => {
      // Owner создает воркспейс и entity
      const ownerWorkspaceId = await ownerClient.mutation(api.workspaces.createWorkspace, {
        name: "Owner Workspace",
        personal: false,
      });

      const entityId = await ownerClient.mutation(api.workspaces.createEntity, {
        workspaceId: ownerWorkspaceId,
      });

      // Member создает свой воркспейс
      const memberWorkspaceId = await memberClient.mutation(api.workspaces.createWorkspace, {
        name: "Member Workspace",
        personal: false,
      });

      // Owner делится entity с member воркспейсом
      await ownerClient.mutation(api.workspaces.createEntityAccess, {
        workspaceId: memberWorkspaceId,
        entityId,
        accessLevel: "editor",
      });

      // Теперь member может проверить доступ к shared entity
      const memberPersonalWorkspace = await memberClient.query(api.workspaces.getPersonalWorkspace, {});
      const memberUserId = memberPersonalWorkspace?.ownerId || "";

      const hasAccess = await memberClient.query(api.workspaces.checkEntityAccess, {
        entityId,
        userId: memberUserId as any,
      });

      expect(hasAccess).toBe(true);
    });
  });

  describe("checkUserPermission Security", () => {
    it("should allow checking user permission within own workspace", async () => {
      // Owner создает воркспейс
      const workspaceId = await ownerClient.mutation(api.workspaces.createWorkspace, {
        name: "Test Workspace",
        personal: false,
      });

      // Owner приглашает member в воркспейс
      const memberPersonalWorkspace = await memberClient.query(api.workspaces.getPersonalWorkspace, {});
      const memberUserId = memberPersonalWorkspace?.ownerId || "";

      await ownerClient.mutation(api.workspaces.createMembership, {
        workspaceId,
        userId: memberUserId as any,
        userRole: "editor",
      });

      // Owner может проверить права member в своем воркспейсе
      const hasPermission = await ownerClient.query(api.workspaces.checkUserPermission, {
        workspaceId,
        targetUserId: memberUserId as any,
        requiredRole: "editor",
      });

      expect(hasPermission).toBe(true);
    });

    it("should not allow checking user permission outside own workspace", async () => {
      // Owner создает воркспейс
      const workspaceId = await ownerClient.mutation(api.workspaces.createWorkspace, {
        name: "Owner Workspace",
        personal: false,
      });

      // Outsider пытается проверить права в чужом воркспейсе
      const outsiderPersonalWorkspace = await outsiderClient.query(api.workspaces.getPersonalWorkspace, {});
      const outsiderUserId = outsiderPersonalWorkspace?.ownerId || "";

      await expect(
        outsiderClient.query(api.workspaces.checkUserPermission, {
          workspaceId,
          targetUserId: outsiderUserId as any,
          requiredRole: "viewer",
        })
      ).rejects.toThrow("Access denied - you are not a member of this workspace");
    });

    it("should correctly check role hierarchy", async () => {
      // Owner создает воркспейс
      const workspaceId = await ownerClient.mutation(api.workspaces.createWorkspace, {
        name: "Test Workspace",
        personal: false,
      });

      // Owner приглашает member в воркспейс с ролью editor
      const memberPersonalWorkspace = await memberClient.query(api.workspaces.getPersonalWorkspace, {});
      const memberUserId = memberPersonalWorkspace?.ownerId || "";

      await ownerClient.mutation(api.workspaces.createMembership, {
        workspaceId,
        userId: memberUserId as any,
        userRole: "editor",
      });

      // Editor должен иметь права viewer
      const hasViewerPermission = await ownerClient.query(api.workspaces.checkUserPermission, {
        workspaceId,
        targetUserId: memberUserId as any,
        requiredRole: "viewer",
      });

      // Editor не должен иметь права admin
      const hasAdminPermission = await ownerClient.query(api.workspaces.checkUserPermission, {
        workspaceId,
        targetUserId: memberUserId as any,
        requiredRole: "admin",
      });

      expect(hasViewerPermission).toBe(true);
      expect(hasAdminPermission).toBe(false);
    });
  });

  describe("Cross-Workspace Security", () => {
    it("should prevent cross-workspace information leakage", async () => {
      // Owner создает воркспейс
      const ownerWorkspaceId = await ownerClient.mutation(api.workspaces.createWorkspace, {
        name: "Owner Workspace",
        personal: false,
      });

      // Member создает свой воркспейс
      const memberWorkspaceId = await memberClient.mutation(api.workspaces.createWorkspace, {
        name: "Member Workspace",
        personal: false,
      });

      // Owner приглашает member в свой воркспейс
      const memberPersonalWorkspace = await memberClient.query(api.workspaces.getPersonalWorkspace, {});
      const memberUserId = memberPersonalWorkspace?.ownerId || "";

      await ownerClient.mutation(api.workspaces.createMembership, {
        workspaceId: ownerWorkspaceId,
        userId: memberUserId as any,
        userRole: "viewer",
      });

      // Member не может проверить доступ к entity в owner воркспейсе через checkEntityAccess
      const entityId = await ownerClient.mutation(api.workspaces.createEntity, {
        workspaceId: ownerWorkspaceId,
      });

      // Это должно работать, так как member состоит в owner воркспейсе
      const hasAccess = await memberClient.query(api.workspaces.checkEntityAccess, {
        entityId,
        userId: memberUserId as any,
      });

      expect(hasAccess).toBe(true);

      // Но member не может проверить права outsider в owner воркспейсе
      // потому что outsider не является членом этого воркспейса
      const outsiderPersonalWorkspace = await outsiderClient.query(api.workspaces.getPersonalWorkspace, {});
      const outsiderUserId = outsiderPersonalWorkspace?.ownerId || "";

      // Это должно вернуть false, а не выбросить ошибку
      const hasOutsiderPermission = await memberClient.query(api.workspaces.checkUserPermission, {
        workspaceId: ownerWorkspaceId,
        targetUserId: outsiderUserId as any,
        requiredRole: "viewer",
      });

      expect(hasOutsiderPermission).toBe(false);
    });
  });
});
