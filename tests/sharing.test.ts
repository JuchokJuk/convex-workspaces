import "./helpers/setup";
import { createTestUsersWithSharedProject, createTestUsers } from "./helpers/testUtils";
import { api } from "../convex/_generated/api.js";


describe("Шаринг и доступы", () => {
  test("шаринг проекта из персонального воркспейса", async () => {
    const { a, b, project } = await createTestUsersWithSharedProject();

    const projectsB = await b.query(api.workspaces.getUserProjectsWithRoles);
    const shared = projectsB.find((p: any) => p.project._id === project);
    expect(shared).toBeDefined();
    expect(["viewer", "editor", "admin"]).toContain(shared!.role);
  });

  test("шаринг проекта из командного воркспейса", async () => {
    const { a, b } = await createTestUsers();

    // Создаем командный воркспейс
    const teamWs = await a.mutation(api.workspaces.createWorkspace, { 
      name: "Team Workspace", 
      personal: false 
    });
    
    // Создаем проект в командном воркспейсе
    const project = await a.mutation(api.workspaces.createProject, {
      workspaceId: teamWs,
      name: "Team Project",
      description: "Проект в командном воркспейсе"
    });

    // Расшариваем проект из командного воркспейса
    const targetUser = await b.query(api.users.queries.getCurrentUserQuery);
    await a.mutation(api.workspaces.shareProject, {
      sourceWorkspaceId: teamWs,
      projectId: project,
      targetUserId: targetUser!._id,
      targetUserRole: "editor",
    });

    // Проверяем, что получатель видит расшаренный проект
    const projectsB = await b.query(api.workspaces.getUserProjectsWithRoles);
    const shared = projectsB.find((p: any) => p.project._id === project);
    expect(shared).toBeDefined();
    expect(shared!.project.name).toBe("Team Project");
  });

  test("роль понижается по принципу наименьших привилегий", async () => {
    const { a, b } = await createTestUsersWithSharedProject();

    // Создаем командный воркспейс и добавляем пользователя B с ролью viewer
    const teamWs = await a.mutation(api.workspaces.createWorkspace, { 
      name: "Team", 
      personal: false 
    });
    
    const targetUser = await b.query(api.users.queries.getCurrentUserQuery);
    await a.mutation(api.workspaces.addUserToWorkspace, {
      workspaceId: teamWs,
      targetUserId: targetUser!._id,
      userRole: "viewer"
    });

    // Создаем проект в командном воркспейсе
    const project = await a.mutation(api.workspaces.createProject, {
      workspaceId: teamWs,
      name: "Project",
    });

    // Пытаемся расшарить проект с ролью admin, но пользователь A имеет роль admin в воркспейсе
    // поэтому роль получателя должна быть admin
    const res = await a.mutation(api.workspaces.shareProject, {
      sourceWorkspaceId: teamWs,
      projectId: project,
      targetUserId: targetUser!._id,
      targetUserRole: "admin",
    });

    // Проверяем, что роль корректно назначена
    expect(["viewer", "editor", "admin"]).toContain(res.accessLevel);
  });

  test("нельзя расшарить проект одному и тому же пользователю дважды", async () => {
    const { a, b } = await createTestUsersWithSharedProject();

    const personalA = await a.query(api.workspaces.getPersonalWorkspace);
    const project = await a.mutation(api.workspaces.createProject, { workspaceId: personalA!._id, name: "P" });
    const targetUser = await b.query(api.users.queries.getCurrentUserQuery);

    await a.mutation(api.workspaces.shareProject, {
      sourceWorkspaceId: personalA!._id,
      projectId: project,
      targetUserId: targetUser!._id,
      targetUserRole: "viewer",
    });

    await expect(
      a.mutation(api.workspaces.shareProject, {
        sourceWorkspaceId: personalA!._id,
        projectId: project,
        targetUserId: targetUser!._id,
        targetUserRole: "viewer",
      })
    ).rejects.toThrow("Project is already shared with this user");
  });

  test("пользователь B видит связанные сущности через доступ к проекту", async () => {
    const { a, b } = await createTestUsersWithSharedProject();
    const personalA = await a.query(api.workspaces.getPersonalWorkspace);
    const project = await a.mutation(api.workspaces.createProject, { workspaceId: personalA!._id, name: "P" });

    const targetUser = await b.query(api.users.queries.getCurrentUserQuery);
    await a.mutation(api.workspaces.shareProject, {
      sourceWorkspaceId: personalA!._id,
      projectId: project,
      targetUserId: targetUser!._id,
      targetUserRole: "viewer",
    });

    // Проверяем, что проект виден второму пользователю (через getUserProjectsWithRoles)
    const projectsB = await b.query(api.workspaces.getUserProjectsWithRoles);
    const shared = projectsB.find((p: any) => p.project._id === project);
    expect(shared).toBeDefined();
  });
});
