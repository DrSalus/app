import { z } from "zod";
import { getBaseUnion } from "./base";
import { withZod } from "@remix-validated-form/with-zod";
import { DateTime } from "luxon";

const booking = z.object({
  date: z
    .string()
    .refine((val) => DateTime.fromFormat(val, "yyyy-MM-dd").isValid, {
      message: "La data di nascita non è valida",
    }),
  firstName: z.string().min(2, { message: "Il nome è obbligatorio" }),
  agendaId: z.string(),
  clinicId: z.string(),
  serviceId: z.string(),
  lastName: z.string().min(2, { message: "Il cognome è obbligatorio" }),
});

export const validator = withZod(booking);
