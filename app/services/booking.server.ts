import { parseMultipartFormData } from "~/utils/utils.server";
import { authenticator } from "./auth.server";
import { validator } from "~/validators/booking";
import { validationError } from "remix-validated-form";
import { db } from "~/utils/db.server";
import { date } from "zod";
import Twillio from "twilio";
import { getDisplayName } from "~/utils/patient";
import { DateTime } from "luxon";
import { sendBookingConfirmation } from "~/utils/whatsapp";

// const FROM_TWILLIO = process.env.TWILLIO_BOOKING_FROM;
// const client = Twillio(
// 	process.env.TWILLIO_ACCOUNT_SID,
// 	process.env.TWILLIO_AUTH_TOKEN,
// );

export async function handleRequest(request: Request) {
	const form = await parseMultipartFormData(request);

	// const user = await authenticator.isAuthenticated(request, {
	//   failureRedirect: "/login",
	// });

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
		_redirect,
	} = data;

	// First let's get the service.
	const service = await db.serviceOffering.findUnique({
		where: {
			id: serviceId,
		},
		include: {
			service: true,
			clinic: true,
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

	const bookedAt = DateTime.fromISO(date).toISO()!;

	// Let's create the booking.
	const booking = await db.serviceBooking.create({
		data: {
			patientId: patient.id,
			bookedAt,
			duration: service.duration,
			serviceId: service.id,
			agendaId,
		},
	});

	await sendBookingConfirmation({
		address: `${service.clinic.address}, ${service.clinic.city}`,
		name: getDisplayName(patient),
		bookedAt: booking.bookedAt.toISOString(),
		bookingId: booking.id,
		clinic: service.clinic.name,
		recipient: patient.phoneNumber!,
		service: service.service.name,
	});

	return _redirect ?? `/confirmation/${booking.id}`;
}
