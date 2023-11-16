import { z } from "zod";
import { getBaseUnion } from "./base";
import { withZod } from "@remix-validated-form/with-zod";

const serviceOffering = z.object({
  amount: z.coerce.number().min(1, "Il prezzo deve essere maggiore di 1€"),
  doctorId: z.string(),
  serviceId: z.string(),
  clinicId: z.string(),
  duration: z.coerce
    .number()
    .min(1, "La durata deve essere maggiore di 1 minuto"),
});

const union = getBaseUnion(serviceOffering);
export const validator = withZod(union);
