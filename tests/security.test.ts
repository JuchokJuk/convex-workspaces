import { describe, it, expect, beforeEach } from "vitest";
import dotenv from "dotenv";
import { ConvexHttpClient } from "convex/browser";
import { api } from "../convex/_generated/api.js";
import { clearDatabase } from "./utils/clearDatabase.js";
import { createSignedClient } from "./utils/createSignedClient.js";

// Инициализируем dotenv для доступа к переменным окружения
dotenv.config({ path: ".env.local" });

const convexUrl = process.env.CONVEX_URL!;

describe("Convex Workspaces - Entity Sharing & Security Tests", () => {
  let ownerClient: ConvexHttpClient;
  let memberClient: ConvexHttpClient;
  let outsiderClient: ConvexHttpClient;

  beforeEach(async () => {
    // Очищаем базу данных перед каждым тестом
    await clearDatabase();
    
    // Создаем трех аутентифицированных пользователей
    ownerClient = await createSignedClient();
    memberClient = await createSignedClient();
    outsiderClient = await createSignedClient();
  });

  describe("Entity Sharing Security", () => {
    it("should allow admin to share entity with other workspaces", async () => {
      // Создаем два воркспейса
      const sourceWorkspaceId = await ownerClient.mutation(api.workspaces.createWorkspace, {
        name: "Source Workspace",
        personal: false,
      });

      const targetWorkspaceId = await memberClient.mutation(api.workspaces.createWorkspace, {
        name: "Target Workspace",
        personal: false,
      });

      // Создаем entity в исходном воркспейсе
      const entityId = await ownerClient.mutation(api.workspaces.createEntity, {
        workspaceId: sourceWorkspaceId,
      });

      // Шерим entity в целевой воркспейс
      const entityAccessId = await ownerClient.mutation(api.workspaces.createEntityAccess, {
        workspaceId: targetWorkspaceId,
        entityId,
        accessLevel: "editor",
      });

      expect(entityAccessId).toBeDefined();

      // Проверяем, что entity доступна в целевом воркспейсе
      const entityAccess = await memberClient.query(api.workspaces.getEntityAccessByEntity, {
        entityId,
      });

      expect(entityAccess).toHaveLength(1);
      expect(entityAccess[0].workspaceId).toBe(targetWorkspaceId);
      expect(entityAccess[0].accessLevel).toBe("editor");
    });

    it("should not allow viewer to share entities", async () => {
      // Создаем воркспейс
      const sourceWorkspaceId = await ownerClient.mutation(api.workspaces.createWorkspace, {
        name: "Source Workspace",
        personal: false,
      });

      const targetWorkspaceId = await memberClient.mutation(api.workspaces.createWorkspace, {
        name: "Target Workspace",
        personal: false,
      });

      // Создаем entity
      const entityId = await ownerClient.mutation(api.workspaces.createEntity, {
        workspaceId: sourceWorkspaceId,
      });

      // Viewer не должен иметь возможность шерить entity
      await expect(
        memberClient.mutation(api.workspaces.createEntityAccess, {
          workspaceId: targetWorkspaceId,
          entityId,
          accessLevel: "editor",
        })
      ).rejects.toThrow("Insufficient permissions");
    });

    it("should not allow sharing entity to non-existent workspace", async () => {
      // Создаем воркспейс
      const sourceWorkspaceId = await ownerClient.mutation(api.workspaces.createWorkspace, {
        name: "Source Workspace",
        personal: false,
      });

      // Создаем entity
      const entityId = await ownerClient.mutation(api.workspaces.createEntity, {
        workspaceId: sourceWorkspaceId,
      });

      // Пытаемся шерить в несуществующий воркспейс
      await expect(
        ownerClient.mutation(api.workspaces.createEntityAccess, {
          workspaceId: "non-existent-workspace" as any,
          entityId,
          accessLevel: "editor",
        })
      ).rejects.toThrow();
    });

    it("should prevent duplicate entity access", async () => {
      // Создаем два воркспейса
      const sourceWorkspaceId = await ownerClient.mutation(api.workspaces.createWorkspace, {
        name: "Source Workspace",
        personal: false,
      });

      const targetWorkspaceId = await memberClient.mutation(api.workspaces.createWorkspace, {
        name: "Target Workspace",
        personal: false,
      });

      // Создаем entity
      const entityId = await ownerClient.mutation(api.workspaces.createEntity, {
        workspaceId: sourceWorkspaceId,
      });

      // Создаем первый entityAccess
      await ownerClient.mutation(api.workspaces.createEntityAccess, {
        workspaceId: targetWorkspaceId,
        entityId,
        accessLevel: "editor",
      });

      // Пытаемся создать дублирующий entityAccess
      await expect(
        ownerClient.mutation(api.workspaces.createEntityAccess, {
          workspaceId: targetWorkspaceId,
          entityId,
          accessLevel: "admin",
        })
      ).rejects.toThrow();
    });
  });

  describe("Permission Escalation Prevention", () => {
    it("should not allow user to escalate their own permissions", async () => {
      // Создаем два воркспейса
      const sourceWorkspaceId = await ownerClient.mutation(api.workspaces.createWorkspace, {
        name: "Source Workspace",
        personal: false,
      });

      const targetWorkspaceId = await memberClient.mutation(api.workspaces.createWorkspace, {
        name: "Target Workspace",
        personal: false,
      });

      // Создаем entity
      const entityId = await ownerClient.mutation(api.workspaces.createEntity, {
        workspaceId: sourceWorkspaceId,
      });

      // Шерим entity с viewer правами
      const entityAccessId = await ownerClient.mutation(api.workspaces.createEntityAccess, {
        workspaceId: targetWorkspaceId,
        entityId,
        accessLevel: "viewer",
      });

      // Пользователь не должен иметь возможность повысить свои права
      await expect(
        memberClient.mutation(api.workspaces.updateEntityAccessLevel, {
          accessId: entityAccessId,
          accessLevel: "admin",
        })
      ).rejects.toThrow();
    });

    it("should not allow outsider to access shared entity without membership", async () => {
      // Создаем два воркспейса
      const sourceWorkspaceId = await ownerClient.mutation(api.workspaces.createWorkspace, {
        name: "Source Workspace",
        personal: false,
      });

      const targetWorkspaceId = await memberClient.mutation(api.workspaces.createWorkspace, {
        name: "Target Workspace",
        personal: false,
      });

      // Создаем entity
      const entityId = await ownerClient.mutation(api.workspaces.createEntity, {
        workspaceId: sourceWorkspaceId,
      });

      // Шерим entity
      await ownerClient.mutation(api.workspaces.createEntityAccess, {
        workspaceId: targetWorkspaceId,
        entityId,
        accessLevel: "editor",
      });

      // Третий пользователь не должен иметь доступ к entity
      const effectiveAccess = await outsiderClient.query(api.workspaces.getUserEffectiveAccess, {
        entityId,
      });

      expect(effectiveAccess).toBeNull();
    });

    it("should respect role hierarchy in effective access", async () => {
      // Создаем два воркспейса
      const sourceWorkspaceId = await ownerClient.mutation(api.workspaces.createWorkspace, {
        name: "Source Workspace",
        personal: false,
      });

      const targetWorkspaceId = await memberClient.mutation(api.workspaces.createWorkspace, {
        name: "Target Workspace",
        personal: false,
      });

      // Создаем entity
      const entityId = await ownerClient.mutation(api.workspaces.createEntity, {
        workspaceId: sourceWorkspaceId,
      });

      // Шерим entity с viewer правами
      await ownerClient.mutation(api.workspaces.createEntityAccess, {
        workspaceId: targetWorkspaceId,
        entityId,
        accessLevel: "viewer",
      });

      // Проверяем эффективный доступ (должен быть viewer, так как это минимальная роль)
      const effectiveAccess = await memberClient.query(api.workspaces.getUserEffectiveAccess, {
        entityId,
      });

      expect(effectiveAccess).toBe("viewer");
    });
  });

  describe("Entity Access Management", () => {
    it("should allow updating entity access level", async () => {
      // Создаем два воркспейса
      const sourceWorkspaceId = await ownerClient.mutation(api.workspaces.createWorkspace, {
        name: "Source Workspace",
        personal: false,
      });

      const targetWorkspaceId = await memberClient.mutation(api.workspaces.createWorkspace, {
        name: "Target Workspace",
        personal: false,
      });

      // Создаем entity
      const entityId = await ownerClient.mutation(api.workspaces.createEntity, {
        workspaceId: sourceWorkspaceId,
      });

      // Создаем entityAccess
      const entityAccessId = await ownerClient.mutation(api.workspaces.createEntityAccess, {
        workspaceId: targetWorkspaceId,
        entityId,
        accessLevel: "viewer",
      });

      // Обновляем уровень доступа
      await ownerClient.mutation(api.workspaces.updateEntityAccessLevel, {
        accessId: entityAccessId,
        accessLevel: "editor",
      });

      // Проверяем обновление
      const entityAccess = await ownerClient.query(api.workspaces.getEntityAccessByEntity, {
        entityId,
      });

      expect(entityAccess).toHaveLength(1);
      expect(entityAccess[0].accessLevel).toBe("editor");
    });

    it("should allow removing entity access", async () => {
      // Создаем два воркспейса
      const sourceWorkspaceId = await ownerClient.mutation(api.workspaces.createWorkspace, {
        name: "Source Workspace",
        personal: false,
      });

      const targetWorkspaceId = await memberClient.mutation(api.workspaces.createWorkspace, {
        name: "Target Workspace",
        personal: false,
      });

      // Создаем entity
      const entityId = await ownerClient.mutation(api.workspaces.createEntity, {
        workspaceId: sourceWorkspaceId,
      });

      // Создаем entityAccess
      const entityAccessId = await ownerClient.mutation(api.workspaces.createEntityAccess, {
        workspaceId: targetWorkspaceId,
        entityId,
        accessLevel: "editor",
      });

      // Удаляем entityAccess
      await ownerClient.mutation(api.workspaces.removeEntityAccess, {
        accessId: entityAccessId,
      });

      // Проверяем, что entityAccess удален
      const entityAccess = await ownerClient.query(api.workspaces.getEntityAccessByEntity, {
        entityId,
      });

      expect(entityAccess).toHaveLength(0);
    });

    it("should not allow non-admin to remove entity access", async () => {
      // Создаем два воркспейса
      const sourceWorkspaceId = await ownerClient.mutation(api.workspaces.createWorkspace, {
        name: "Source Workspace",
        personal: false,
      });

      const targetWorkspaceId = await memberClient.mutation(api.workspaces.createWorkspace, {
        name: "Target Workspace",
        personal: false,
      });

      // Создаем entity
      const entityId = await ownerClient.mutation(api.workspaces.createEntity, {
        workspaceId: sourceWorkspaceId,
      });

      // Создаем entityAccess
      const entityAccessId = await ownerClient.mutation(api.workspaces.createEntityAccess, {
        workspaceId: targetWorkspaceId,
        entityId,
        accessLevel: "editor",
      });

      // Пользователь не должен иметь возможность удалить entityAccess
      await expect(
        memberClient.mutation(api.workspaces.removeEntityAccess, {
          accessId: entityAccessId,
        })
      ).rejects.toThrow();
    });
  });

  describe("Cross-Workspace Entity Access", () => {
    it("should allow accessing shared entity from different workspace", async () => {
      // Создаем два воркспейса
      const sourceWorkspaceId = await ownerClient.mutation(api.workspaces.createWorkspace, {
        name: "Source Workspace",
        personal: false,
      });

      const targetWorkspaceId = await memberClient.mutation(api.workspaces.createWorkspace, {
        name: "Target Workspace",
        personal: false,
      });

      // Создаем entity в исходном воркспейсе
      const entityId = await ownerClient.mutation(api.workspaces.createEntity, {
        workspaceId: sourceWorkspaceId,
      });

      // Создаем документ для этой entity
      const documentId = await ownerClient.mutation(api.documents.mutations.createDocument, {
        entityId,
        title: "Shared Document",
      });

      // Шерим entity в целевой воркспейс
      await ownerClient.mutation(api.workspaces.createEntityAccess, {
        workspaceId: targetWorkspaceId,
        entityId,
        accessLevel: "editor",
      });

      // Проверяем, что документ доступен из целевого воркспейса
      const document = await memberClient.query(api.documents.queries.getDocumentById, {
        documentId,
      });

      expect(document).toBeDefined();
      expect(document?.title).toBe("Shared Document");
    });

    it("should not allow accessing tasks from shared entity (tasks are workspace-only)", async () => {
      // Создаем два воркспейса
      const sourceWorkspaceId = await ownerClient.mutation(api.workspaces.createWorkspace, {
        name: "Source Workspace",
        personal: false,
      });

      const targetWorkspaceId = await memberClient.mutation(api.workspaces.createWorkspace, {
        name: "Target Workspace",
        personal: false,
      });

      // Создаем entity в исходном воркспейсе
      const entityId = await ownerClient.mutation(api.workspaces.createEntity, {
        workspaceId: sourceWorkspaceId,
      });

      // Создаем задачу для этой entity
      const taskId = await ownerClient.mutation(api.tasks.mutations.createTask, {
        entityId,
        title: "Private Task",
      });

      // Шерим entity в целевой воркспейс
      await ownerClient.mutation(api.workspaces.createEntityAccess, {
        workspaceId: targetWorkspaceId,
        entityId,
        accessLevel: "editor",
      });

      // Проверяем, что задача НЕ доступна из целевого воркспейса
      await expect(
        memberClient.query(api.tasks.queries.getTaskById, {
          taskId,
        })
      ).rejects.toThrow();
    });
  });
});
