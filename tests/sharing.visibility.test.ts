import "./helpers/setup";
import { createAuthedClient } from "./helpers/clients";
import { clearDatabase } from "./helpers/database";
import { api } from "../convex/_generated/api.js";


describe("Шаринг: видимость проектов и сущностей", () => {
  test("получатель видит расшаренный проект в своей выборке проектов", async () => {
    await clearDatabase();
    
    const a = await createAuthedClient();
    const b = await createAuthedClient();

    const personalA = await a.query(api.workspaces.getPersonalWorkspace);
    const project = await a.mutation(api.workspaces.createProject, { workspaceId: personalA!._id, name: "P" });

    const userB = await b.query(api.users.queries.getCurrentUserQuery);
    await a.mutation(api.workspaces.shareProject, {
      sourceWorkspaceId: personalA!._id,
      projectId: project,
      targetUserId: userB!._id,
      targetUserRole: "viewer",
    });

    const projectsB = await b.query(api.workspaces.getUserProjectsWithRoles);
    const shared = projectsB.find((p: any) => p.project._id === project);
    expect(shared).toBeDefined();
    expect(["viewer", "editor", "admin"]).toContain(shared!.role);
  });
});

