import { z } from "zod";
import { withZod } from "@remix-validated-form/with-zod";
import { DateTime } from "luxon";

const booking = z.object({
  date: z.string().refine((val) => DateTime.fromISO(val).isValid, {
    message: "La data  non è valida",
  }),
  _redirect: z.string().optional(),
  firstName: z.string().min(2, { message: "Il nome è obbligatorio" }),
  agendaId: z.string(),
  clinicId: z.string(),
  serviceId: z.string(),
  lastName: z.string().min(2, { message: "Il cognome è obbligatorio" }),
  phoneNumber: z.string(),
  emailAddress: z.string(),
});

export const validator = withZod(booking);
