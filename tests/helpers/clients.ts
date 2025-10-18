import { ConvexHttpClient } from "convex/browser";
import { api } from "../../convex/_generated/api.js";

const convexUrl = process.env.CONVEX_URL!;

export async function createAuthedClient(): Promise<ConvexHttpClient> {
  const client = new ConvexHttpClient(convexUrl);
  const authResult = await client.action(api.auth.signIn, { provider: "anonymous" });
  if (!authResult.tokens) throw new Error("Не получены токены при авторизации анонимного пользователя");
  client.setAuth(authResult.tokens.token);
  return client;
}
