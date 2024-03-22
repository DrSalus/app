import { LoaderFunctionArgs } from "@remix-run/node";
import { DateTime } from "luxon";
import { sendBookingReminder } from "~/services/remind";
import { db } from "~/utils/db.server";

export async function loader({ request, params }: LoaderFunctionArgs) {
	const tomorrowsBooking = await db.serviceBooking.findMany({
		select: { id: true },
		where: {
			bookedAt: {
				gte: DateTime.now().endOf("day").toISO(),
				lt: DateTime.now().plus({ day: 1 }).endOf("day").toISO(),
			},
		},
	});
	for (const booking of tomorrowsBooking) {
		sendBookingReminder(booking.id);
	}
}
