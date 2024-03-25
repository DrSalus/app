import { parseMultipartFormData } from "~/utils/utils.server";
import { authenticator } from "./auth.server";
import { validator } from "~/validators/acceptance";
import { validationError } from "remix-validated-form";
import { db } from "~/utils/db.server";
import { BookingState } from "@prisma/client";

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

	const { bookingId, firstName, lastName, fiscalCode, date, _redirect } =
		result.data;

	// Get the booking
	const booking = await db.serviceBooking.findUnique({
		where: { id: bookingId },
	});
	if (booking == null) {
		throw new Error("Booking not found");
	}

	// Now let's check if the fiscal code is already in use.
	const existingPatient = await db.patient.findFirst({
		where: { fiscalCode },
	});

	// If the patient already exists, we don't need to create a new one.
	if (existingPatient) {
		// Link to the previous patient.
		await db.serviceBooking.update({
			where: { id: bookingId },
			data: {
				patientId: existingPatient.id,
			},
		});

		// Delete the existing.
		await db.patient.delete({
			where: { id: booking.patientId },
		});
	} else {
		// Update the booking
		await db.patient.update({
			data: {
				firstName,
				lastName,
				fiscalCode,
			},
			where: { id: booking.patientId },
		});
	}

	// Update the booking state.
	await db.serviceBooking.update({
		data: {
			status: BookingState.COMPLETED,
			acceptedAt: new Date(date),
		},
		where: {
			id: bookingId,
		},
	});

	return _redirect;
}
