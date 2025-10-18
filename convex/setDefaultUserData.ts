import { MutationCtx } from "./_generated/server";
import { Id } from "./_generated/dataModel";
import { initializePersonalWorkspace } from "../src/utils/initializePersonalWorkspace";

export async function setDefaultUserData(
  ctx: MutationCtx,
  { userId }: { userId: Id<"users"> },
) {
  const user = await ctx.db.get(userId);

  if (user?.defaultDataInitialized) {
    return;
  }

  // Создаем персональный воркспейс с помощью утилиты
  await initializePersonalWorkspace(ctx, userId, `${user?.name || "User"}'s Personal Workspace`);

  // Обновляем флаг инициализации
  await ctx.db.patch(userId, {
    defaultDataInitialized: true,
  });
}
