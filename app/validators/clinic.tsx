import { withZod } from "@remix-validated-form/with-zod";
import z from "zod";

export const clinicSchema = {
  name: z.string().min(1, { message: "Il nome è obbligatorio" }),
  address: z.string().min(1, { message: "L'indirizzo è obbligatorio" }),
  city: z.string().min(1, { message: "La città è obbligatoria" }),
  province: z.string().length(2, { message: "La provincia è obbligatoria" }),
  postalCode: z.string().length(5, { message: "Il CAP è obbligatoria" }),
};
export const clinic = z.object(clinicSchema);

export const clinicKeys = Object.keys(clinicSchema);
export type Clinic = z.infer<typeof clinic>;

const union = z.discriminatedUnion("_action", [
  z
    .object({ _action: z.literal("create"), _redirect: z.string().optional() })
    .extend(clinicSchema),
  z
    .object({
      _action: z.literal("update"),
      _id: z.string(),
      _redirect: z.string().optional(),
    })
    .extend(clinicSchema),
  z.object({
    _action: z.literal("delete"),
    _id: z.string(),
    _redirect: z.string().optional(),
  }),
]);



export const validator = withZod(union);
