import dotenv from "dotenv";
import { ConvexHttpClient } from "convex/browser";
import { api } from "../../convex/_generated/api.js";

dotenv.config({ path: ".env.local" });

const convexUrl = process.env.CONVEX_URL!;

export async function clearDatabase(): Promise<void> {
  const client = new ConvexHttpClient(convexUrl);
  await client.mutation(api.utils.testHelpers.clear);
}
