import { parseMultipartFormData } from "~/utils/utils.server";
import { authenticator } from "./auth.server";
import { validator } from "~/validators/booking";
import { validationError } from "remix-validated-form";
import { db } from "~/utils/db.server";
import { date } from "zod";

export async function handleRequest(request: Request) {
	const form = await parseMultipartFormData(request);

	const user = await authenticator.isAuthenticated(request, {
		failureRedirect: "/login",
	});

	// Validate
	const result = await validator.validate(form);
	if (result.error) {
		return validationError(result.error);
	}

	const { data } = result;
	const {
		firstName,
		lastName,
		emailAddress,
		phoneNumber,
		date,
		serviceId,
		agendaId,
	} = data;

	// First let's get the service.
	const service = await db.serviceOffering.findUnique({
		where: {
			id: serviceId,
		},
	});
	if (service == null) {
		throw new Error("Service not found");
	}

	const patient = await db.patient.create({
		data: {
			firstName,
			lastName,
			emailAddress,
			phoneNumber,
		},
	});

	// Let's create the booking.
	await db.serviceBooking.create({
		data: {
			patientId: patient.id,
			bookedAt: date,
			duration: service.duration,
			serviceId: service.id,
			agendaId,
		},
	});
}
