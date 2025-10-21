import { describe, it, expect, beforeEach } from "vitest";
import dotenv from "dotenv";
import { ConvexHttpClient } from "convex/browser";
import { api } from "../convex/_generated/api.js";
import { clearDatabase } from "./utils/clearDatabase.js";
import { createSignedClient } from "./utils/createSignedClient.js";
import { Doc } from "../convex/_generated/dataModel.js";
import { UserRole } from "../src/types.js";

// Инициализируем dotenv для доступа к переменным окружения
dotenv.config({ path: ".env.local" });

const convexUrl = process.env.CONVEX_URL!;

describe("Convex Workspaces - Basic Tests", () => {
  let client1: ConvexHttpClient;
  let client2: ConvexHttpClient;

  beforeEach(async () => {
    // Очищаем базу данных перед каждым тестом
    await clearDatabase();
    
    // Создаем двух аутентифицированных пользователей
    client1 = await createSignedClient();
    client2 = await createSignedClient();
  });

  describe("Workspace Management", () => {
    it("should have personal workspace created automatically", async () => {
      // Персональный воркспейс должен создаваться автоматически при авторизации
      const personalWorkspace = await client1.query(api.workspaces.getPersonalWorkspace, {});

      expect(personalWorkspace).toBeDefined();
      expect(personalWorkspace?.personal).toBe(true);
      expect(personalWorkspace?.userRole).toBe("admin");
    });

    it("should not allow creating multiple personal workspaces", async () => {
      // Пытаемся создать второй персональный воркспейс
      await expect(
        client1.mutation(api.workspaces.createWorkspace, {
          name: "Second Personal Workspace",
          personal: true,
        })
      ).rejects.toThrow("User already has a personal workspace");
    });

    it("should create a regular workspace", async () => {
      const workspaceId = await client1.mutation(api.workspaces.createWorkspace, {
        name: "Team Workspace",
        personal: false,
      });

      expect(workspaceId).toBeDefined();

      const workspace = await client1.query(api.workspaces.getWorkspaceById, {
        workspaceId,
      }) as Doc<"workspaces"> & { userRole: UserRole } | null;

      expect(workspace).toBeDefined();
      expect(workspace?.name).toBe("Team Workspace");
      expect(workspace?.personal).toBe(false);
      expect(workspace?.userRole).toBe("admin");
    });

    it("should get personal workspace", async () => {
      // Получаем персональный воркспейс (он уже должен существовать)
      const personalWorkspace = await client1.query(api.workspaces.getPersonalWorkspace, {});

      expect(personalWorkspace).toBeDefined();
      expect(personalWorkspace?.personal).toBe(true);
    });
  });

  describe("Entity Management", () => {
    it("should create entity in workspace", async () => {
      // Создаем обычный воркспейс (персональный уже существует)
      const workspaceId = await client1.mutation(api.workspaces.createWorkspace, {
        name: "Test Workspace",
        personal: false,
      });

      // Создаем entity в воркспейсе
      const entityId = await client1.mutation(api.workspaces.createEntity, {
        workspaceId,
      });

      expect(entityId).toBeDefined();
      expect(typeof entityId).toBe("string");

      // Проверяем, что entity создалась
      const entity = await client1.query(api.workspaces.getEntityById, {
        entityId,
      });

      expect(entity).toBeDefined();
      expect(entity?.workspaceId).toBe(workspaceId);
    });

    it("should not allow viewer to create entity", async () => {
      // Создаем обычный воркспейс (персональный уже существует)
      const workspaceId = await client1.mutation(api.workspaces.createWorkspace, {
        name: "Test Workspace",
        personal: false,
      });

      // Второй пользователь не должен иметь возможность создать entity в чужом воркспейсе
      await expect(
        client2.mutation(api.workspaces.createEntity, {
          workspaceId,
        })
      ).rejects.toThrow("Insufficient permissions");
    });
  });

  describe("Document Management", () => {
    it("should create document with entity", async () => {
      // Создаем обычный воркспейс (персональный уже существует)
      const workspaceId = await client1.mutation(api.workspaces.createWorkspace, {
        name: "Document Workspace",
        personal: false,
      });

      // Создаем документ с entity через action
      const result = await client1.mutation(api.documents.mutations.createDocumentWithEntity, {
        workspaceId,
        title: "Test Document",
      });

      expect(result).toBeDefined();
      expect(result.entityId).toBeDefined();
      expect(result.documentId).toBeDefined();

      // Проверяем, что документ создался
      const document = await client1.query(api.documents.queries.getDocumentById, {
        documentId: result.documentId,
      });

      expect(document).toBeDefined();
      expect(document?.title).toBe("Test Document");
      expect(document?.entityId).toBe(result.entityId);
    });

    it("should get documents by entity", async () => {
      // Создаем обычный воркспейс и документ (персональный уже существует)
      const workspaceId = await client1.mutation(api.workspaces.createWorkspace, {
        name: "Document Workspace",
        personal: false,
      });

      const result = await client1.mutation(api.documents.mutations.createDocumentWithEntity, {
        workspaceId,
        title: "Test Document",
      });

      // Получаем документы по entity
      const documents = await client1.query(api.documents.queries.getDocumentsByEntity, {
        entityId: result.entityId,
      });

      expect(documents).toHaveLength(1);
      expect(documents[0]?.title).toBe("Test Document");
    });
  });

  describe("Task Management", () => {
    it("should create task with entity", async () => {
      // Создаем обычный воркспейс (персональный уже существует)
      const workspaceId = await client1.mutation(api.workspaces.createWorkspace, {
        name: "Task Workspace",
        personal: false,
      });

      // Создаем задачу с entity через action
      const result = await client1.mutation(api.tasks.mutations.createTaskWithEntity, {
        workspaceId,
        title: "Test Task",
      });

      expect(result).toBeDefined();
      expect(result.entityId).toBeDefined();
      expect(result.taskId).toBeDefined();

      // Проверяем, что задача создалась
      const task = await client1.query(api.tasks.queries.getTaskById, {
        taskId: result.taskId,
      });

      expect(task).toBeDefined();
      expect(task?.title).toBe("Test Task");
      expect(task?.entityId).toBe(result.entityId);
    });

    it("should get tasks by entity", async () => {
      // Создаем обычный воркспейс и задачу (персональный уже существует)
      const workspaceId = await client1.mutation(api.workspaces.createWorkspace, {
        name: "Task Workspace",
        personal: false,
      });

      const result = await client1.mutation(api.tasks.mutations.createTaskWithEntity, {
        workspaceId,
        title: "Test Task",
      });

      // Получаем задачи по entity
      const tasks = await client1.query(api.tasks.queries.getTasksByEntity, {
        entityId: result.entityId,
      });

      expect(tasks).toHaveLength(1);
      expect(tasks[0]?.title).toBe("Test Task");
    });
  });
});
