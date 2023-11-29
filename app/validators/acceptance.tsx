import { withZod } from "@remix-validated-form/with-zod";
import { z } from "zod";

export const acceptance = z.object({
	bookingId: z.string(),
	date: z.string(),
	firstName: z.string(),
	lastName: z.string(),
	fiscalCode: z.string(),
	_redirect: z.string(),
});

export const validator = withZod(acceptance);
