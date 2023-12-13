import { z } from "zod";
import { getBaseUnion } from "./base";
import { Gender } from "@prisma/client/edge.js";
import CodiceFiscale from "codice-fiscale-js";
import { withZod } from "@remix-validated-form/with-zod";
import { DateTime } from "luxon";

const patient = z.object({
  firstName: z.string().min(1, { message: "Il nome è obbligatorio" }),
  lastName: z.string().min(1, { message: "Il cognome è obbligatorio" }),
  gender: z.nativeEnum(Gender, {
    errorMap: () => ({ message: "Il genere è obbligatorio" }),
  }),
  birthDate: z
    .string()
    .refine((val) => DateTime.fromFormat(val, "yyyy-MM-dd").isValid, {
      message: "La data di nascita non è valida",
    }),
  birthCity: z
    .string()
    .min(1, { message: "La città di nascita è obbligatoria" }),
  fiscalCode: z
    .string()
    .min(1, { message: "Il codice fiscale è obbligatorio" })
    .refine(
      (val) => {
        try {
          const cf = new CodiceFiscale(val);
          return cf.isValid();
        } catch (e) {
          return false;
        }
      },
      {
        message: "Il codice fiscale non è valido",
      }
    ),
  emailAddress: z
    .string()
    .email({ message: "L'email non è valida" })
    .optional(),
});

const union = getBaseUnion(patient);
export const validator = withZod(union);
