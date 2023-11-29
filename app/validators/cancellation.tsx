import { withZod } from "@remix-validated-form/with-zod";
import { z } from "zod";

export const cancellation = z.object({
	bookingId: z.string(),
	date: z.string(),
	cancellationMessage: z.string(),
	_redirect: z.string(),
});

export const validator = withZod(cancellation);
