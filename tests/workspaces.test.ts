import "./helpers/setup";
import { createTestUser } from "./helpers/testUtils";
import { api } from "../convex/_generated/api.js";

describe("Система воркспейсов", () => {

  test("получение персонального воркспейса", async () => {
    const client = await createTestUser();
    const currentUser = await client.query(api.users.queries.getCurrentUserQuery);
    if (!currentUser) return;

    const personalWorkspace = await client.query(api.workspaces.getPersonalWorkspace);
    expect(personalWorkspace).toBeDefined();
    expect(personalWorkspace?.personal).toBe(true);
  });

  test("создание воркспейса", async () => {
    const client = await createTestUser();
    const currentUser = await client.query(api.users.queries.getCurrentUserQuery);
    if (!currentUser) return;

    const workspaceId = await client.mutation(api.workspaces.createWorkspace, {
      name: "Team Workspace",
      personal: false,
    });

    const workspace = await client.query(api.workspaces.getWorkspace, { workspaceId });
    expect(workspace?.name).toBe("Team Workspace");
    expect(workspace?.personal).toBe(false);
  });

  test("получение воркспейсов пользователя", async () => {
    const client = await createTestUser();
    const currentUser = await client.query(api.users.queries.getCurrentUserQuery);
    if (!currentUser) return;

    const userWorkspaces = await client.query(api.workspaces.getUserWorkspaces);
    expect(Array.isArray(userWorkspaces)).toBe(true);
    expect(userWorkspaces.length).toBeGreaterThan(0);
  });
});

