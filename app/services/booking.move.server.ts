import { parseMultipartFormData } from "~/utils/utils.server";
import { authenticator } from "./auth.server";
import { validator } from "~/validators/move";
import { validationError } from "remix-validated-form";
import { db } from "~/utils/db.server";
import { BookingState } from "@prisma/client";
import { DateTime } from "luxon";

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

	const { bookingId, bookedAt, _redirect } = result.data;

	// Get the booking
	const booking = await db.serviceBooking.findUnique({
		where: { id: bookingId },
	});
	if (booking == null) {
		throw new Error("Booking not found");
	}

	// Update the booking state.
	await db.serviceBooking.update({
		data: {
			bookedAt: DateTime.fromISO(bookedAt).toJSDate(),
		},
		where: {
			id: bookingId,
		},
	});

	return _redirect;
}
