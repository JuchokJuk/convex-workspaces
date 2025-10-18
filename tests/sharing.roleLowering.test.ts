import "./helpers/setup";
import { createAuthedClient } from "./helpers/clients";
import { clearDatabase } from "./helpers/database";
import { api } from "../convex/_generated/api.js";

/**
 * Тесты понижания роли при шаринге (principle of least privilege)
 */


describe("Шаринг: понижение роли", () => {
  test("viewer в исходном воркспейсе ограничивает роль получателя до viewer", async () => {
    await clearDatabase();
    
    const owner = await createAuthedClient();
    const viewer = await createAuthedClient();
    const target = await createAuthedClient();

    const ws = await owner.mutation(api.workspaces.createWorkspace, { name: "Team", personal: false });
    const personal = await owner.query(api.workspaces.getPersonalWorkspace);

    // Создаём проект и даём доступ воркспейсу владельца (admin назначается при создании проекта)
    const project = await owner.mutation(api.workspaces.createProject, { workspaceId: ws, name: "P" });

    // Добавляем viewer-пользователя в исходный воркспейс
    const viewerUser = await viewer.query(api.users.queries.getCurrentUserQuery);
    await owner.mutation(api.workspaces.addUserToWorkspace, {
      workspaceId: ws,
      targetUserId: viewerUser!._id,
      userRole: "viewer",
    });

    // viewer пытается расшарить как editor - должен быть ограничен
    const targetUser = await target.query(api.users.queries.getCurrentUserQuery);
    const res = await viewer.mutation(api.workspaces.shareProject, {
      sourceWorkspaceId: ws,
      projectId: project,
      targetUserId: targetUser!._id,
      targetUserRole: "editor",
    });

    expect(res.accessLevel).toBe("viewer");
  });
});

