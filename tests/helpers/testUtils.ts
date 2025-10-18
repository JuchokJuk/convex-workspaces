import { createAuthedClient } from "./clients";
import { clearDatabase } from "./database";
import { api } from "../../convex/_generated/api";

/**
 * Создает тестового пользователя с очисткой БД
 */
export async function createTestUser() {
  await clearDatabase();
  return await createAuthedClient();
}

/**
 * Создает двух тестовых пользователей с очисткой БД
 */
export async function createTestUsers() {
  await clearDatabase();
  const a = await createAuthedClient();
  const b = await createAuthedClient();
  return { a, b };
}

/**
 * Создает тестового пользователя с проектом
 */
export async function createTestUserWithProject() {
  const client = await createTestUser();
  
  const personalWorkspace = await client.query(api.workspaces.getPersonalWorkspace);
  if (!personalWorkspace) {
    throw new Error("Personal workspace not found");
  }

  const projectId = await client.mutation(api.workspaces.createProject, {
    workspaceId: personalWorkspace._id,
    name: "Test Project",
    description: "A test project",
  });

  return { client, personalWorkspace, projectId };
}

/**
 * Создает тестовых пользователей с общим проектом
 */
export async function createTestUsersWithSharedProject() {
  const { a, b } = await createTestUsers();

  const personalA = await a.query(api.workspaces.getPersonalWorkspace);
  if (!personalA) {
    throw new Error("Personal workspace A not found");
  }

  const project = await a.mutation(api.workspaces.createProject, {
    workspaceId: personalA._id,
    name: "Shared Project",
    description: "A project to be shared",
  });

  const userB = await b.query(api.users.queries.getCurrentUserQuery);
  if (!userB) {
    throw new Error("User B not found");
  }

  await a.mutation(api.workspaces.shareProject, {
    sourceWorkspaceId: personalA._id,
    projectId: project,
    targetUserId: userB._id,
    targetUserRole: "viewer",
  });

  return { a, b, personalA, project, userB };
}
