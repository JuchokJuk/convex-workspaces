// Stub functions for TypeScript compilation
// These will be replaced by actual Convex functions at runtime

export const query = (config: any) => config;
export const mutation = (config: any) => config;
export const v = {
  string: () => "string",
  boolean: () => "boolean",
  optional: (validator: any) => validator,
  id: (table: string) => `Id<"${table}">`,
  union: (...validators: any[]) => "union",
  literal: (value: any) => `literal(${value})`,
};

// Stub types for TypeScript compilation
export type Id<T extends string> = string & { __tableName: T };
export const getAuthUserId = async (ctx: any): Promise<string | null> => {
  // This will be replaced by actual Convex function at runtime
  return null;
};
