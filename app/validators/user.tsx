import { z } from "zod";
import { withZod } from "@remix-validated-form/with-zod";
import { DateTime } from "luxon";
import { getBaseUnion } from "./base";

const baseUser = z.object({
	firstName: z.string().min(2, { message: "Il nome è obbligatorio" }),
	lastName: z.string().min(2, { message: "Il cognome è obbligatorio" }),
	email: z.string().email({ message: "L'email non è valida" }),
	kind: z.enum([
		"ADMIN",
		"DOCTOR",
		"DOCTOR_ASSISTANT",
		"CLINIC_MANAGER",
		"PATIENT",
	]),
});

const user = z.discriminatedUnion("_action", [
	baseUser.extend({
		_action: z.literal("create"),
		_redirect: z.string().optional(),
		password: z.string().min(6, { message: "La password è obbligatoria" }),
		passwordConfirmation: z.string(),
	}),
	baseUser.extend({
		_action: z.literal("update"),
		_id: z.string(),
		_redirect: z.string().optional(),
	}),
]);

export const validator = withZod(user);
