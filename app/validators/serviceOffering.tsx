import { z } from "zod";
import { getBaseUnion } from "./base";
import { withZod } from "@remix-validated-form/with-zod";

const serviceOffering = z.object({
	amount: z.coerce.number().min(1, "Il prezzo deve essere maggiore di 1€"),
	doctorId: z.string().min(1, "Devi selezionare un medico"),
	serviceId: z.string().min(1, "Devi selezionare una prestazione"),
	clinicId: z.string().min(1, "Devi selezionare una clinica"),
	duration: z.coerce
		.number()
		.min(1, "La durata deve essere maggiore di 1 minuto"),
});

const union = getBaseUnion(serviceOffering);
export const validator = withZod(union);
