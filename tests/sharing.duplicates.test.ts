import "./helpers/setup";
import { createAuthedClient } from "./helpers/clients";
import { clearDatabase } from "./helpers/database";
import { api } from "../convex/_generated/api.js";


describe("Шаринг: запрет дублирования", () => {
  test("нельзя расшарить один и тот же проект одному и тому же пользователю дважды", async () => {
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

    await expect(
      a.mutation(api.workspaces.shareProject, {
        sourceWorkspaceId: personalA!._id,
        projectId: project,
        targetUserId: userB!._id,
        targetUserRole: "viewer",
      })
    ).rejects.toThrow("Project is already shared with this user");
  });
});

