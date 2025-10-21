import { describe, it, expect, beforeEach } from "vitest";
import dotenv from "dotenv";
import { ConvexHttpClient } from "convex/browser";
import { api } from "../convex/_generated/api.js";
import { clearDatabase } from "./utils/clearDatabase.js";
import { createSignedClient } from "./utils/createSignedClient.js";

// Инициализируем dotenv для доступа к переменным окружения
dotenv.config({ path: ".env.local" });

const convexUrl = process.env.CONVEX_URL!;

describe("Convex Workspaces - Group Access & Role-Based Permissions Tests", () => {
  let adminClient: ConvexHttpClient;
  let editorClient: ConvexHttpClient;
  let viewerClient: ConvexHttpClient;
  let outsiderClient: ConvexHttpClient;

  // Реальные ID пользователей из auth
  let adminUserId: string;
  let editorUserId: string;
  let viewerUserId: string;
  let outsiderUserId: string;

  beforeEach(async () => {
    // Очищаем базу данных перед каждым тестом
    await clearDatabase();
    
    // Создаем четырех аутентифицированных пользователей
    adminClient = await createSignedClient();
    editorClient = await createSignedClient();
    viewerClient = await createSignedClient();
    outsiderClient = await createSignedClient();

    // Получаем реальные ID пользователей из их персональных воркспейсов
    const adminPersonalWorkspace = await adminClient.query(api.workspaces.getPersonalWorkspace, {});
    const editorPersonalWorkspace = await editorClient.query(api.workspaces.getPersonalWorkspace, {});
    const viewerPersonalWorkspace = await viewerClient.query(api.workspaces.getPersonalWorkspace, {});
    const outsiderPersonalWorkspace = await outsiderClient.query(api.workspaces.getPersonalWorkspace, {});

    adminUserId = adminPersonalWorkspace?.ownerId || "";
    editorUserId = editorPersonalWorkspace?.ownerId || "";
    viewerUserId = viewerPersonalWorkspace?.ownerId || "";
    outsiderUserId = outsiderPersonalWorkspace?.ownerId || "";
  });

  describe("Workspace Membership Management", () => {
    it("should allow admin to invite users to workspace", async () => {
      // Админ создает воркспейс
      const workspaceId = await adminClient.mutation(api.workspaces.createWorkspace, {
        name: "Team Workspace",
        personal: false,
      });

      // Используем реальные ID пользователей

      // Админ приглашает редактора
      const editorMembershipId = await adminClient.mutation(api.workspaces.createMembership, {
        workspaceId,
        userId: editorUserId as any,
        userRole: "editor",
      });

      expect(editorMembershipId).toBeDefined();

      // Админ приглашает зрителя
      const viewerMembershipId = await adminClient.mutation(api.workspaces.createMembership, {
        workspaceId,
        userId: viewerUserId as any,
        userRole: "viewer",
      });

      expect(viewerMembershipId).toBeDefined();

      // Проверяем, что пользователи добавлены в воркспейс
      const memberships = await adminClient.query(api.workspaces.getMembershipsByWorkspace, {
        workspaceId,
      });

      expect(memberships).toHaveLength(3); // admin + editor + viewer
    });

    it("should not allow non-admin to invite users", async () => {
      // Создаем воркспейс
      const workspaceId = await adminClient.mutation(api.workspaces.createWorkspace, {
        name: "Team Workspace",
        personal: false,
      });

      // Используем реальный ID редактора

      // Редактор не должен иметь возможность приглашать пользователей
      await expect(
        editorClient.mutation(api.workspaces.createMembership, {
          workspaceId,
          userId: editorUserId as any,
          userRole: "editor",
        })
      ).rejects.toThrow("Insufficient permissions");
    });

    it("should allow admin to update member roles", async () => {
      // Создаем воркспейс
      const workspaceId = await adminClient.mutation(api.workspaces.createWorkspace, {
        name: "Team Workspace",
        personal: false,
      });

      // Используем реальный ID редактора

      // Приглашаем редактора
      const membershipId = await adminClient.mutation(api.workspaces.createMembership, {
        workspaceId,
        userId: editorUserId as any,
        userRole: "editor",
      });

      // Обновляем роль на admin
      await adminClient.mutation(api.workspaces.updateMembershipRole, {
        membershipId,
        userRole: "admin",
      });

      // Проверяем обновление
      const membership = await adminClient.query(api.workspaces.getMembershipByWorkspaceAndUser, {
        workspaceId,
        userId: editorUserId as any,
      });

      expect(membership?.userRole).toBe("admin");
    });

    it("should not allow non-admin to update member roles", async () => {
      // Создаем воркспейс
      const workspaceId = await adminClient.mutation(api.workspaces.createWorkspace, {
        name: "Team Workspace",
        personal: false,
      });

      // Используем реальный ID редактора

      // Приглашаем редактора
      const membershipId = await adminClient.mutation(api.workspaces.createMembership, {
        workspaceId,
        userId: editorUserId as any,
        userRole: "editor",
      });

      // Редактор не должен иметь возможность обновлять роли
      await expect(
        editorClient.mutation(api.workspaces.updateMembershipRole, {
          membershipId,
          userRole: "admin",
        })
      ).rejects.toThrow("Insufficient permissions");
    });
  });

  describe("Entity Access Based on Workspace Roles", () => {
    it("should allow all workspace members to access entities", async () => {
      // Создаем воркспейс
      const workspaceId = await adminClient.mutation(api.workspaces.createWorkspace, {
        name: "Team Workspace",
        personal: false,
      });

      // Создаем entity в воркспейсе
      const entityId = await adminClient.mutation(api.workspaces.createEntity, {
        workspaceId,
      });

      // Создаем документ для entity
      const documentId = await adminClient.mutation(api.documents.mutations.createDocument, {
        entityId,
        title: "Team Document",
      });

      // Все члены воркспейса должны иметь доступ к entity
      const adminAccess = await adminClient.query(api.workspaces.getUserEffectiveAccess, {
        entityId,
      });
      expect(adminAccess).toBe("admin");

      // Проверяем доступ к документу
      const document = await adminClient.query(api.documents.queries.getDocumentById, {
        documentId,
      });
      expect(document).toBeDefined();
      expect(document?.title).toBe("Team Document");
    });

    it("should not allow outsiders to access workspace entities", async () => {
      // Создаем воркспейс
      const workspaceId = await adminClient.mutation(api.workspaces.createWorkspace, {
        name: "Private Workspace",
        personal: false,
      });

      // Создаем entity в воркспейсе
      const entityId = await adminClient.mutation(api.workspaces.createEntity, {
        workspaceId,
      });

      // Создаем документ для entity
      const documentId = await adminClient.mutation(api.documents.mutations.createDocument, {
        entityId,
        title: "Private Document",
      });

      // Посторонний пользователь не должен иметь доступ к entity
      const outsiderAccess = await outsiderClient.query(api.workspaces.getUserEffectiveAccess, {
        entityId,
      });
      expect(outsiderAccess).toBeNull();

      // Посторонний пользователь не должен иметь доступ к документу
      await expect(
        outsiderClient.query(api.documents.queries.getDocumentById, {
          documentId,
        })
      ).rejects.toThrow();
    });

    it("should allow workspace members to see all entities in their workspace", async () => {
      // Создаем воркспейс
      const workspaceId = await adminClient.mutation(api.workspaces.createWorkspace, {
        name: "Team Workspace",
        personal: false,
      });

      // Создаем несколько entities
      const entity1Id = await adminClient.mutation(api.workspaces.createEntity, {
        workspaceId,
      });

      const entity2Id = await adminClient.mutation(api.workspaces.createEntity, {
        workspaceId,
      });

      // Создаем документы для entities
      await adminClient.mutation(api.documents.mutations.createDocument, {
        entityId: entity1Id,
        title: "Document 1",
      });

      await adminClient.mutation(api.documents.mutations.createDocument, {
        entityId: entity2Id,
        title: "Document 2",
      });

      // Админ должен видеть все entities в воркспейсе
      const accessibleEntities = await adminClient.query(api.workspaces.getUserAccessibleEntities, {});

      // Должно быть минимум 2 entities (плюс персональные воркспейсы)
      const workspaceEntities = accessibleEntities.filter(e => e.workspaceId === workspaceId);
      expect(workspaceEntities).toHaveLength(2);
      expect(workspaceEntities[0].userRole).toBe("admin");
      expect(workspaceEntities[1].userRole).toBe("admin");
    });
  });

  describe("Role-Based Permissions Within Workspace", () => {
    it("should allow admin to create entities", async () => {
      // Создаем воркспейс
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

    it("should allow editor to create entities", async () => {
      // Создаем воркспейс
      const workspaceId = await adminClient.mutation(api.workspaces.createWorkspace, {
        name: "Team Workspace",
        personal: false,
      });

      // Используем реальный ID редактора

      // Приглашаем редактора
      await adminClient.mutation(api.workspaces.createMembership, {
        workspaceId,
        userId: editorUserId as any,
        userRole: "editor",
      });

      // Редактор должен иметь возможность создать entity
      const entityId = await editorClient.mutation(api.workspaces.createEntity, {
        workspaceId,
      });

      expect(entityId).toBeDefined();
    });

    it("should not allow viewer to create entities", async () => {
      // Создаем воркспейс
      const workspaceId = await adminClient.mutation(api.workspaces.createWorkspace, {
        name: "Team Workspace",
        personal: false,
      });

      // Используем реальный ID зрителя

      // Приглашаем зрителя
      await adminClient.mutation(api.workspaces.createMembership, {
        workspaceId,
        userId: viewerUserId as any,
        userRole: "viewer",
      });

      // Зритель не должен иметь возможность создать entity
      await expect(
        viewerClient.mutation(api.workspaces.createEntity, {
          workspaceId,
        })
      ).rejects.toThrow("Insufficient permissions");
    });

    it("should allow admin to delete entities", async () => {
      // Создаем воркспейс
      const workspaceId = await adminClient.mutation(api.workspaces.createWorkspace, {
        name: "Team Workspace",
        personal: false,
      });

      // Создаем entity
      const entityId = await adminClient.mutation(api.workspaces.createEntity, {
        workspaceId,
      });

      // Админ должен иметь возможность удалить entity
      await adminClient.mutation(api.workspaces.removeEntity, {
        entityId,
      });

      // Проверяем, что entity удалена
      const entity = await adminClient.query(api.workspaces.getEntityById, {
        entityId,
      });
      expect(entity).toBeNull();
    });

    it("should not allow editor to delete entities", async () => {
      // Создаем воркспейс
      const workspaceId = await adminClient.mutation(api.workspaces.createWorkspace, {
        name: "Team Workspace",
        personal: false,
      });

      // Используем реальный ID редактора

      // Приглашаем редактора
      await adminClient.mutation(api.workspaces.createMembership, {
        workspaceId,
        userId: editorUserId as any,
        userRole: "editor",
      });

      // Создаем entity
      const entityId = await adminClient.mutation(api.workspaces.createEntity, {
        workspaceId,
      });

      // Редактор не должен иметь возможность удалить entity
      await expect(
        editorClient.mutation(api.workspaces.removeEntity, {
          entityId,
        })
      ).rejects.toThrow();
    });
  });

  describe("Cross-Role Entity Operations", () => {
    it("should allow editor to create documents in shared entity", async () => {
      // Создаем воркспейс
      const workspaceId = await adminClient.mutation(api.workspaces.createWorkspace, {
        name: "Team Workspace",
        personal: false,
      });

      // Используем реальный ID редактора

      // Приглашаем редактора
      await adminClient.mutation(api.workspaces.createMembership, {
        workspaceId,
        userId: editorUserId as any,
        userRole: "editor",
      });

      // Создаем entity
      const entityId = await adminClient.mutation(api.workspaces.createEntity, {
        workspaceId,
      });

      // Редактор должен иметь возможность создать документ
      const documentId = await editorClient.mutation(api.documents.mutations.createDocument, {
        entityId,
        title: "Editor Document",
      });

      expect(documentId).toBeDefined();

      // Проверяем, что документ создан
      const document = await editorClient.query(api.documents.queries.getDocumentById, {
        documentId,
      });
      expect(document?.title).toBe("Editor Document");
    });

    it("should allow viewer to read documents but not create them", async () => {
      // Создаем воркспейс
      const workspaceId = await adminClient.mutation(api.workspaces.createWorkspace, {
        name: "Team Workspace",
        personal: false,
      });

      // Используем реальный ID зрителя

      // Приглашаем зрителя
      await adminClient.mutation(api.workspaces.createMembership, {
        workspaceId,
        userId: viewerUserId as any,
        userRole: "viewer",
      });

      // Создаем entity и документ
      const entityId = await adminClient.mutation(api.workspaces.createEntity, {
        workspaceId,
      });

      const documentId = await adminClient.mutation(api.documents.mutations.createDocument, {
        entityId,
        title: "Viewer Document",
      });

      // Зритель должен иметь возможность читать документ
      const document = await viewerClient.query(api.documents.queries.getDocumentById, {
        documentId,
      });
      expect(document?.title).toBe("Viewer Document");

      // Зритель не должен иметь возможность создать документ
      await expect(
        viewerClient.mutation(api.documents.mutations.createDocument, {
          entityId,
          title: "New Document",
        })
      ).rejects.toThrow();
    });

    it("should allow admin to update documents created by others", async () => {
      // Создаем воркспейс
      const workspaceId = await adminClient.mutation(api.workspaces.createWorkspace, {
        name: "Team Workspace",
        personal: false,
      });

      // Используем реальный ID редактора

      // Приглашаем редактора
      await adminClient.mutation(api.workspaces.createMembership, {
        workspaceId,
        userId: editorUserId as any,
        userRole: "editor",
      });

      // Создаем entity
      const entityId = await adminClient.mutation(api.workspaces.createEntity, {
        workspaceId,
      });

      // Редактор создает документ
      const documentId = await editorClient.mutation(api.documents.mutations.createDocument, {
        entityId,
        title: "Original Title",
      });

      // Админ должен иметь возможность обновить документ
      await adminClient.mutation(api.documents.mutations.updateDocument, {
        documentId,
        title: "Updated by Admin",
      });

      // Проверяем обновление
      const document = await adminClient.query(api.documents.queries.getDocumentById, {
        documentId,
      });
      expect(document?.title).toBe("Updated by Admin");
    });
  });
});
