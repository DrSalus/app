import { z } from "zod";
import { getBaseUnion } from "./base";
import { withZod } from "@remix-validated-form/with-zod";
import { ServiceType } from "@prisma/client";

const agenda = z.object({
  name: z.string().min(1, { message: "Il nome è obbligatorio" }),
  clinicId: z.string(),
  type: z.nativeEnum(ServiceType, {
    errorMap: () => ({ message: "Il tipo è obbligatorio" }),
  }),
  doctorId: z.string().optional(),
  services: z.array(z.object({
    id: z.string()
  }))
});

const union = getBaseUnion(agenda);
export const validator = withZod(union);
