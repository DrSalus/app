import type { ZodRawShape, ZodSchema, ZodTypeAny } from "zod";
import z, { object } from "zod";

export function getBaseUnion<T extends ZodRawShape, Z extends ZodRawShape>(schema: z.ZodObject<T>, updateSchema?: z.ZodObject<Z>) {
  return z.discriminatedUnion("_action", [
    schema.extend({
      _action: z.literal("create"),
      _redirect: z.string().optional(),
    }),
    object({
      _action: z.literal("delete"),
      _id: z.string(),
      _redirect: z.string().optional(),
    }),
    (updateSchema ?? schema).extend({
      _action: z.literal("update"),
      _id: z.string(),
      _redirect: z.string().optional(),
    })
  ]);
}
