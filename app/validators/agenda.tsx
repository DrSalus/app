import { z } from "zod";
import { getBaseUnion } from "./base";
import { withZod } from "@remix-validated-form/with-zod";
import { ServiceType } from "@prisma/client";
import { DateTime } from "luxon";
import { isEmpty } from "lodash-es";

const dateSchema = z.string().refine((val) => DateTime.fromISO(val).isValid, {
  message: "Must be a valid ISO string date",
});

const optionalDateSchema = z
  .string()
  .optional()
  .refine((val) => isEmpty(val) || DateTime.fromISO(val).isValid, {
    message: "Must be a valid ISO string date",
  });

const dailyPlan = z
  .array(
    z.object({
      from: z.string(),
      to: z.string(),
    })
  )
  .optional();

const agenda = z.object({
  name: z.string().min(1, { message: "Il nome è obbligatorio" }),
  clinicId: z.string(),
  type: z.nativeEnum(ServiceType, {
    errorMap: () => ({ message: "Il tipo è obbligatorio" }),
  }),
  doctorId: z.string(),
  services: z.array(
    z.object({
      id: z.string(),
    })
  ),
  slotInterval: z.coerce
    .number()
    .min(1, { message: "La durata dello slot è obbligatorio" }),
  validFrom: dateSchema,
  validUntil: optionalDateSchema,

  mon: dailyPlan,
  tue: dailyPlan,
  wed: dailyPlan,
  thu: dailyPlan,
  fri: dailyPlan,
  sat: dailyPlan,
  sun: dailyPlan,
});

export type Agenda = z.infer<typeof agenda>;
const union = getBaseUnion(agenda);
export const validator = withZod(union);
