import { withZod } from "@remix-validated-form/with-zod";
import { z } from "zod";

export const move = z.object({
	bookingId: z.string(),
	bookedAt: z.string(),
	_redirect: z.string(),
});

export const validator = withZod(move);
