import { z } from "zod";
import { getBaseUnion } from "./base";
import { Gender } from '@prisma/client';
import CodiceFiscale  from 'codice-fiscale-js';
import { withZod } from "@remix-validated-form/with-zod";

const patient = z.object({
  firstName: z.string().min(1, { message: "Il nome è obbligatorio" }),
  lastName: z.string().min(1, { message: "Il cognome è obbligatorio" }),
  gender: z.nativeEnum(Gender),
  fiscalCode: z.string().min(1, { message: "Il codice fiscale è obbligatorio" }).refine((val) => {
    try {
      const cf = new CodiceFiscale(val);
      return cf.isValid();
    } catch (e) {
      return false;
    }
  }, {
    message: "Il codice fiscale non è valido"
  }),
  emailAddress: z.string().email({ message: "L'email non è valida" }).optional(),
});


const union = getBaseUnion(patient)
export const validator = withZod(union);
