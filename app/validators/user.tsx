import { z } from "zod";
import { withZod } from "@remix-validated-form/with-zod";
import { DateTime } from "luxon";
import { getBaseUnion } from "./base";

const user = z
	.object({
		_action: z.literal("create"),
		_redirect: z.string().optional(),
		firstName: z.string().min(2, { message: "Il nome è obbligatorio" }),
		lastName: z.string().min(2, { message: "Il cognome è obbligatorio" }),
		email: z.string(),
		password: z.string(),
		passwordConfirmation: z.string(),
	})
	.refine((data) => data.password !== data.passwordConfirmation, {
		message: "Le password non coincidono",
		path: ["passwordConfirmation"],
	});

export const validator = withZod(user);
