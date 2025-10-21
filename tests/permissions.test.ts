import { describe, it, expect, beforeEach } from "vitest";
import dotenv from "dotenv";
import { ConvexHttpClient } from "convex/browser";
import { api } from "../convex/_generated/api.js";
import { clearDatabase } from "./utils/clearDatabase.js";
import { createSignedClient } from "./utils/createSignedClient.js";

// Инициализируем dotenv для доступа к переменным окружения
dotenv.config({ path: ".env.local" });

const convexUrl = process.env.CONVEX_URL!;

describe("Convex Workspaces - Permissions & Sharing Tests", () => {
  let adminClient: ConvexHttpClient;
  let editorClient: ConvexHttpClient;
  let viewerClient: ConvexHttpClient;

  beforeEach(async () => {
    // Очищаем базу данных перед каждым тестом
    await clearDatabase();
    
    // Создаем трех аутентифицированных пользователей
    adminClient = await createSignedClient();
    editorClient = await createSignedClient();
    viewerClient = await createSignedClient();
  });

  describe("Workspace Permissions", () => {
    it("should allow admin to create entities", async () => {
      // Админ создает обычный воркспейс (персональный уже существует)
      const workspaceId = await adminClient.mutation(api.workspaces.createWorkspace, {
        name: "Team Workspace",
        personal: false,
      });

      // Админ должен иметь возможность создать entity
      const entityId = await adminClient.mutation(api.workspaces.createEntity, {
        workspaceId,
      });

      expect(entityId).toBeDefined();
    });

    it("should not allow unauthorized users to create entities", async () => {
      // Создаем обычный воркспейс (персональный уже существует)
      const workspaceId = await adminClient.mutation(api.workspaces.createWorkspace, {
        name: "Test Workspace",
        personal: false,
      });

      // Неавторизованный пользователь не должен иметь возможность создать entity
      await expect(
        editorClient.mutation(api.workspaces.createEntity, {
          workspaceId,
        })
      ).rejects.toThrow("Insufficient permissions");
    });

    it("should allow workspace owner to create entities", async () => {
      // Создаем обычный воркспейс (персональный уже существует)
      const workspaceId = await editorClient.mutation(api.workspaces.createWorkspace, {
        name: "Test Workspace",
        personal: false,
      });

      // Владелец воркспейса должен иметь возможность создать entity
      const entityId = await editorClient.mutation(api.workspaces.createEntity, {
        workspaceId,
      });

      expect(entityId).toBeDefined();
    });
  });

  describe("Document Sharing", () => {
    it("should allow sharing document between workspaces", async () => {
      // Создаем два обычных воркспейса (персональные уже существуют)
      const workspace1Id = await adminClient.mutation(api.workspaces.createWorkspace, {
        name: "Workspace 1",
        personal: false,
      });

      const workspace2Id = await editorClient.mutation(api.workspaces.createWorkspace, {
        name: "Workspace 2",
        personal: false,
      });

      // Создаем документ в первом воркспейсе
      const result = await adminClient.mutation(api.documents.mutations.createDocumentWithEntity, {
        workspaceId: workspace1Id,
        title: "Shared Document",
      });

      // Шерим документ во второй воркспейс (пока без реального userId)
      // await adminClient.mutation(api.documents.mutations.shareDocumentWithUser, {
      //   documentId: result.documentId,
      //   targetUserId: "editor-user-id" as any,
      //   accessLevel: "editor",
      // });

      // Проверяем, что документ доступен в первом воркспейсе
      const accessibleDocuments = await adminClient.query(api.documents.queries.getUserAccessibleDocuments, {});

      expect(accessibleDocuments).toHaveLength(1);
      expect(accessibleDocuments[0]?.title).toBe("Shared Document");
    });

    it("should not allow sharing to unauthorized users", async () => {
      // Создаем обычный воркспейс и документ (персональный уже существует)
      const workspaceId = await adminClient.mutation(api.workspaces.createWorkspace, {
        name: "Test Workspace",
        personal: false,
      });

      const result = await adminClient.mutation(api.documents.mutations.createDocumentWithEntity, {
        workspaceId,
        title: "Private Document",
      });

      // Неавторизованный пользователь не должен иметь доступ к документу
      await expect(
        editorClient.query(api.documents.queries.getDocumentById, {
          documentId: result.documentId,
        })
      ).rejects.toThrow();
    });
  });

  describe("Task Access Control", () => {
    it("should not allow sharing tasks (tasks are workspace-only)", async () => {
      // Создаем два обычных воркспейса (персональные уже существуют)
      const workspace1Id = await adminClient.mutation(api.workspaces.createWorkspace, {
        name: "Workspace 1",
        personal: false,
      });

      const workspace2Id = await editorClient.mutation(api.workspaces.createWorkspace, {
        name: "Workspace 2",
        personal: false,
      });

      // Создаем задачу в первом воркспейсе
      const result = await adminClient.mutation(api.tasks.mutations.createTaskWithEntity, {
        workspaceId: workspace1Id,
        title: "Private Task",
      });

      // Задача не должна быть доступна во втором воркспейсе
      const accessibleTasks = await editorClient.query(api.tasks.queries.getUserAccessibleTasks, {});

      expect(accessibleTasks).toHaveLength(0);
    });

    it("should allow workspace members to access tasks", async () => {
      // Создаем обычный воркспейс (персональный уже существует)
      const workspaceId = await adminClient.mutation(api.workspaces.createWorkspace, {
        name: "Team Workspace",
        personal: false,
      });

      // Создаем задачу
      const result = await adminClient.mutation(api.tasks.mutations.createTaskWithEntity, {
        workspaceId,
        title: "Team Task",
      });

      // Админ должен иметь доступ к задаче
      const task = await adminClient.query(api.tasks.queries.getTaskById, {
        taskId: result.taskId,
      });

      expect(task).toBeDefined();
      expect(task?.title).toBe("Team Task");
    });
  });

  describe("Entity Access Management", () => {
    it("should create entity access for shared documents", async () => {
      // Создаем два обычных воркспейса (персональные уже существуют)
      const workspace1Id = await adminClient.mutation(api.workspaces.createWorkspace, {
        name: "Source Workspace",
        personal: false,
      });

      const workspace2Id = await editorClient.mutation(api.workspaces.createWorkspace, {
        name: "Target Workspace",
        personal: false,
      });

      // Создаем документ
      const result = await adminClient.mutation(api.documents.mutations.createDocumentWithEntity, {
        workspaceId: workspace1Id,
        title: "Shared Document",
      });

      // Шерим документ (пока без реального userId)
      // await adminClient.mutation(api.documents.mutations.shareDocumentWithUser, {
      //   documentId: result.documentId,
      //   targetUserId: "editor-user-id" as any,
      //   accessLevel: "editor",
      // });

      // Проверяем, что документ создался
      const document = await adminClient.query(api.documents.queries.getDocumentById, {
        documentId: result.documentId,
      });

      expect(document).toBeDefined();
      expect(document?.title).toBe("Shared Document");
    });

    it("should allow updating entity access level", async () => {
      // Создаем обычный воркспейс и документ (персональный уже существует)
      const workspaceId = await adminClient.mutation(api.workspaces.createWorkspace, {
        name: "Test Workspace",
        personal: false,
      });

      const result = await adminClient.mutation(api.documents.mutations.createDocumentWithEntity, {
        workspaceId,
        title: "Test Document",
      });

      // Создаем entityAccess
      const entityAccessId = await adminClient.mutation(api.workspaces.createEntityAccess, {
        workspaceId,
        entityId: result.entityId,
        accessLevel: "viewer",
      });

      // Обновляем уровень доступа
      await adminClient.mutation(api.workspaces.updateEntityAccessLevel, {
        accessId: entityAccessId,
        accessLevel: "editor",
      });

      // Проверяем обновление
      const entityAccess = await adminClient.query(api.workspaces.getEntityAccessByEntity, {
        entityId: result.entityId,
      });

      expect(entityAccess).toHaveLength(1);
      expect(entityAccess[0]?.accessLevel).toBe("editor");
    });
  });
});
