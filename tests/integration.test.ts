import { describe, it, expect, beforeEach } from "vitest";
import dotenv from "dotenv";
import { ConvexHttpClient } from "convex/browser";
import { api } from "../convex/_generated/api.js";
import { clearDatabase } from "./utils/clearDatabase.js";
import { createSignedClient } from "./utils/createSignedClient.js";

// Инициализируем dotenv для доступа к переменным окружения
dotenv.config({ path: ".env.local" });

const convexUrl = process.env.CONVEX_URL!;

describe("Convex Workspaces - Integration & Callbacks Tests", () => {
  let client: ConvexHttpClient;

  beforeEach(async () => {
    // Очищаем базу данных перед каждым тестом
    await clearDatabase();
    
    // Создаем аутентифицированного пользователя
    client = await createSignedClient();
  });

  describe("Workspace Deletion with Callbacks", () => {
    it("should delete related documents and tasks when workspace is removed", async () => {
      // Создаем обычный воркспейс (персональный уже существует)
      const workspaceId = await client.mutation(api.workspaces.createWorkspace, {
        name: "Test Workspace",
        personal: false,
      });

      // Создаем документы и задачи
      const docResult1 = await client.mutation(api.documents.mutations.createDocument, {
        workspaceId,
        title: "Document 1",
      });

      const docResult2 = await client.mutation(api.documents.mutations.createDocument, {
        workspaceId,
        title: "Document 2",
      });

      const taskResult1 = await client.mutation(api.tasks.mutations.createTask, {
        workspaceId,
        title: "Task 1",
      });

      const taskResult2 = await client.mutation(api.tasks.mutations.createTask, {
        workspaceId,
        title: "Task 2",
      });

      // Проверяем, что все создалось
      const documents = await client.query(api.documents.queries.getUserAccessibleDocuments, {});
      const tasks = await client.query(api.tasks.queries.getUserAccessibleTasks, {});

      expect(documents).toHaveLength(2);
      expect(tasks).toHaveLength(2);

      // Удаляем воркспейс (это должно вызвать callback и удалить все связанные данные)
      await client.mutation(api.workspaces.removeWorkspace, {
        workspaceId,
      });

      // Проверяем, что все связанные данные удалились
      const documentsAfter = await client.query(api.documents.queries.getUserAccessibleDocuments, {});
      const tasksAfter = await client.query(api.tasks.queries.getUserAccessibleTasks, {});

      expect(documentsAfter).toHaveLength(0);
      expect(tasksAfter).toHaveLength(0);
    });

    it("should delete related documents and tasks when entity is removed", async () => {
      // Создаем обычный воркспейс (персональный уже существует)
      const workspaceId = await client.mutation(api.workspaces.createWorkspace, {
        name: "Test Workspace",
        personal: false,
      });

      // Создаем документ с entity в воркспейсе
      const documentResult = await client.mutation(api.documents.mutations.createDocument, {
        workspaceId,
        title: "Test Document",
      });

      const documentId = documentResult.documentId;
      const entityId = documentResult.entityId;

      // Создаем задачу для той же entity
      const taskId = await client.mutation(api.tasks.mutations.createTaskForEntity, {
        entityId,
        title: "Test Task",
      });

      // Проверяем, что все создалось
      const document = await client.query(api.documents.queries.getDocumentById, {
        documentId,
      });
      const task = await client.query(api.tasks.queries.getTaskById, {
        taskId,
      });

      expect(document).toBeDefined();
      expect(task).toBeDefined();

      // Удаляем entity (это должно вызвать callback и удалить связанные данные)
      await client.mutation(api.workspaces.removeEntity, {
        entityId,
      });

      // Проверяем, что связанные данные удалились
      const documentAfter = await client.query(api.documents.queries.getDocumentById, {
        documentId,
      });
      const taskAfter = await client.query(api.tasks.queries.getTaskById, {
        taskId,
      });

      expect(documentAfter).toBeNull();
      expect(taskAfter).toBeNull();
    });
  });

  describe("Complex Workflows", () => {
    it("should handle complete document sharing workflow", async () => {
      // Создаем два обычных воркспейса (персональные уже существуют)
      const workspace1Id = await client.mutation(api.workspaces.createWorkspace, {
        name: "Source Workspace",
        personal: false,
      });

      const workspace2Id = await client.mutation(api.workspaces.createWorkspace, {
        name: "Target Workspace",
        personal: false,
      });

      // Создаем документ в первом воркспейсе
      const result = await client.mutation(api.documents.mutations.createDocument, {
        workspaceId: workspace1Id,
        title: "Shared Document",
      });

      // Шерим документ (пока без реального userId)
      // await client.mutation(api.documents.mutations.shareDocumentWithUser, {
      //   documentId: result.documentId,
      //   targetUserId: "target-user-id" as any,
      //   accessLevel: "editor",
      // });

      // Проверяем, что документ доступен
      const accessibleDocuments = await client.query(api.documents.queries.getUserAccessibleDocuments, {});
      expect(accessibleDocuments).toHaveLength(1);
      expect(accessibleDocuments[0]?.title).toBe("Shared Document");

      // Обновляем документ
      await client.mutation(api.documents.mutations.updateDocument, {
        documentId: result.documentId,
        title: "Updated Shared Document",
      });

      // Проверяем обновление
      const updatedDocument = await client.query(api.documents.queries.getDocumentById, {
        documentId: result.documentId,
      });
      expect(updatedDocument?.title).toBe("Updated Shared Document");
    });

    it("should handle task management workflow", async () => {
      // Создаем обычный воркспейс (персональный уже существует)
      const workspaceId = await client.mutation(api.workspaces.createWorkspace, {
        name: "Task Workspace",
        personal: false,
      });

      // Создаем несколько задач
      const task1 = await client.mutation(api.tasks.mutations.createTask, {
        workspaceId,
        title: "Task 1",
      });

      const task2 = await client.mutation(api.tasks.mutations.createTask, {
        workspaceId,
        title: "Task 2",
      });

      // Получаем все задачи
      const allTasks = await client.query(api.tasks.queries.getUserAccessibleTasks, {});
      expect(allTasks).toHaveLength(2);

      // Обновляем задачу
      await client.mutation(api.tasks.mutations.updateTask, {
        taskId: task1.taskId,
        title: "Updated Task 1",
      });

      // Проверяем обновление
      const updatedTask = await client.query(api.tasks.queries.getTaskById, {
        taskId: task1.taskId,
      });
      expect(updatedTask?.title).toBe("Updated Task 1");

      // Удаляем задачу
      await client.mutation(api.tasks.mutations.removeTask, {
        taskId: task1.taskId,
      });

      // Проверяем удаление
      const remainingTasks = await client.query(api.tasks.queries.getUserAccessibleTasks, {});
      expect(remainingTasks).toHaveLength(1);
      expect(remainingTasks[0]?.title).toBe("Task 2");
    });
  });

  describe("Error Handling", () => {
    it("should handle unauthorized access gracefully", async () => {
      // Создаем обычный воркспейс и документ (персональный уже существует)
      const workspaceId = await client.mutation(api.workspaces.createWorkspace, {
        name: "Private Workspace",
        personal: false,
      });

      const result = await client.mutation(api.documents.mutations.createDocument, {
        workspaceId,
        title: "Private Document",
      });

      // Создаем нового клиента (неавторизованного)
      const unauthorizedClient = await createSignedClient();

      // Неавторизованный клиент не должен иметь доступ
      await expect(
        unauthorizedClient.query(api.documents.queries.getDocumentById, {
          documentId: result.documentId,
        })
      ).rejects.toThrow();
    });

    it("should handle non-existent resources", async () => {
      // Пытаемся получить несуществующий документ
      const nonExistentId = "non-existent-id" as any;
      
      await expect(
        client.query(api.documents.queries.getDocumentById, {
          documentId: nonExistentId,
        })
      ).rejects.toThrow();
    });
  });
});
