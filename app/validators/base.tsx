import type { ZodSchema, ZodTypeAny } from "zod";
import z, { object } from "zod";

export function getBaseUnion<T extends ZodTypeAny>(schema: T) {
  return z.discriminatedUnion("_action", [
    object({
      _action: z.literal("create"),
      _redirect: z.string().optional(),
    }).and(schema),
    object({
      _action: z.literal("delete"),
      _id: z.string(),
      _redirect: z.string().optional(),
    }),
  ]);
}
