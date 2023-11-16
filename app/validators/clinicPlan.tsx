import { z } from "zod";
import { getBaseUnion } from "./base";
import { withZod } from "@remix-validated-form/with-zod";

const clinicPlan = z.object({
  name: z.string().min(1, { message: "Il nome è obbligatorio" }),
  clinicId: z.string(),
  doctorId: z.string().optional(),
});

const union = getBaseUnion(clinicPlan);
export const validator = withZod(union);
