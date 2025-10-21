import dotenv from "dotenv";
import { ConvexHttpClient } from "convex/browser";
import { api } from "../../convex/_generated/api.js";

dotenv.config({ path: ".env.local" });

const convexUrl = process.env.CONVEX_URL!;

export async function createSignedClient(): Promise<ConvexHttpClient> {
  const client = new ConvexHttpClient(convexUrl);
  const authResult = await client.action(api.auth.signIn, { provider: "anonymous" });
  if (!authResult.tokens) throw new Error("Не получены токены при авторизации анонимного пользователя");
  client.setAuth(authResult.tokens.token);
  
  // Ждем немного времени для выполнения callback'а создания персонального воркспейса
  await new Promise(resolve => setTimeout(resolve, 100));
  
  return client;
}
