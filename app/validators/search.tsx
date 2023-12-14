import { withZod } from "@remix-validated-form/with-zod";
import { z } from "zod";

export const searchRequest = z.object({
	service: z.string(),
	city: z.string().optional(),
});
export const validator = withZod(searchRequest);
