import { ActionFunction, LoaderFunctionArgs, json } from "@remix-run/node";
import { validationError } from "remix-validated-form";
import { authenticator } from "~/services/auth.server";
import { db } from "~/utils/db.server";
import { validator } from "~/validators/search";

// Write a remix action
export const action: ActionFunction = async ({ request }) => {
	const form = await request.json();

	// Validate
	const result = await validator.validate(form as any);
	if (result.error) {
		console.log("Got error while searching", result.error);
		return { agendas: [] };
	}

	console.log("Searching for", result.data);
	const agendas = await db.agenda.findMany({
		where: {
			services: {
				some: {
					serviceId: result.data.service,
				},
			},
		},
		include: {
			doctor: {
				select: { firstName: true, lastName: true, specialities: true },
			},
			clinic: true,
			services: true,
		},
	});

	return { agendas };
};
