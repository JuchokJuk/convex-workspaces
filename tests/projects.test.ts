import "./helpers/setup";
import { createTestUserWithProject } from "./helpers/testUtils";
import { api } from "../convex/_generated/api.js";

describe("Система проектов", () => {

  test("создание проекта", async () => {
    const { client, projectId } = await createTestUserWithProject();
    const project = await client.query(api.workspaces.getProject, { projectId });
    expect(project?.name).toBe("Test Project");
  });

  test("проект отображается в проектах пользователя", async () => {
    const { client } = await createTestUserWithProject();
    const userProjects = await client.query(api.workspaces.getUserProjectsWithRoles);
    expect(userProjects.length).toBeGreaterThan(0);
  });

  test("получение проектов пользователя", async () => {
    const { client } = await createTestUserWithProject();
    const userProjects = await client.query(api.workspaces.getUserProjectsWithRoles);
    expect(Array.isArray(userProjects)).toBe(true);
  });
});

