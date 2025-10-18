import { createAuthedClient } from "./clients";
import { api } from "../../convex/_generated/api.js";

export async function clearDatabase(): Promise<void> {
  const tempClient = await createAuthedClient();
  await tempClient.mutation(api.utils.testHelpers.clear);
}
