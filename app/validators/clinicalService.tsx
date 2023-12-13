import { ServiceType } from "@prisma/client";
import { withZod } from "@remix-validated-form/with-zod";
import z from "zod";

export const clinicalServiceSchema = {
	name: z
		.string()
		.min(1, { message: "Il nome della prestazionie è obbligatorio" }),
	branchCode: z
		.string()
		.min(1, { message: "Il codice branca è obbligatoria. " }),
	leaCode: z.string().min(1, { message: "La codifica LEA è obbligatoria. " }),
	type: z.nativeEnum(ServiceType, {
		errorMap: () => ({ message: "Il tipo è obbligatorio" }),
	}),
	nomenCode: z
		.string()
		.min(1, { message: "La codifica Nazionale DM 2012 è obbligatoria. " }),
};
export const clinicalService = z.object(clinicalServiceSchema);
export type Clinic = z.infer<typeof clinicalService>;

const union = z.discriminatedUnion("_action", [
	z
		.object({ _action: z.literal("create"), _redirect: z.string().optional() })
		.extend(clinicalServiceSchema),
	z
		.object({
			_action: z.literal("update"),
			_id: z.string(),
			_redirect: z.string().optional(),
		})
		.extend(clinicalServiceSchema),
	z.object({
		_action: z.literal("delete"),
		_id: z.string(),
		_redirect: z.string().optional(),
	}),
]);

export const validator = withZod(union);
