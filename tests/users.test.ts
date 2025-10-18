import "./helpers/setup";
import { createTestUser } from "./helpers/testUtils";
import { api } from "../convex/_generated/api.js";

describe("Система пользователей", () => {

  test("получение текущего пользователя", async () => {
    const client = await createTestUser();
    const currentUser = await client.query(api.users.queries.getCurrentUserQuery);
    expect(currentUser).toBeTruthy();
  });

  test("получение всех пользователей", async () => {
    const client = await createTestUser();
    const users = await client.query(api.users.queries.getAllUsers);
    expect(Array.isArray(users)).toBe(true);
  });

  test("обновление пользователя", async () => {
    const client = await createTestUser();
    const currentUser = await client.query(api.users.queries.getCurrentUserQuery);
    if (!currentUser) return;

    await client.mutation(api.users.mutations.updateUser, { name: "Updated Name" });
    const updatedUser = await client.query(api.users.queries.getCurrentUserQuery);
    expect(updatedUser?.name).toBe("Updated Name");
  });
});

