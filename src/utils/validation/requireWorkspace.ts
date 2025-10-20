export function requireWorkspace(workspace: any, workspaceId: string): asserts workspace is NonNullable<typeof workspace> {
  if (!workspace) {
    throw new Error(`Workspace ${workspaceId} not found`);
  }
}
