import { z } from "zod";
import { getBaseUnion } from "./base";
import { withZod } from "@remix-validated-form/with-zod";

const doctor = z.object({
	firstName: z.string().min(1, { message: "Il nome è obbligatorio" }),
	lastName: z.string().min(1, { message: "Il cognome è obbligatorio" }),
	email: z.string().email({ message: "L'email è obbligatorio" }),
	fiscalCode: z
		.string()
		.min(1, { message: "Il codice fiscale è obbligatorio" }),
	qualification: z.string().optional(),
	worksAt: z.string().optional(),
});

const union = getBaseUnion(doctor);
export const validator = withZod(union);
