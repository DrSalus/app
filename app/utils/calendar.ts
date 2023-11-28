import { CalendarSlot } from "~/components/simpleCalendar";
import { db } from "./db.server";
import {
	Agenda,
	ClinicalService,
	Patient,
	ServiceOffering,
} from "@prisma/client";
import { WithSerializedTypes } from "./client";
import { DateTime } from "luxon";
import { times } from "lodash-es";
import { getDisplayName } from "./patient";

export async function getCalendarSlots(
	agenda: Agenda,
	options?: {
		lookAhead?: number;
		date?: DateTime;
		includeBookings?: boolean;
	},
): Promise<CalendarSlot[]> {
	const lookAhead = options?.lookAhead ?? 1;
	const date = options?.date ?? DateTime.now();
	// console.log("gte", date.startOf("day").toJSDate());
	// console.log("lte", date.plus({ days: lookAhead }).endOf("day").toJSDate());
	const bookings = await db.serviceBooking.findMany({
		where: {
			agendaId: agenda.id,
			bookedAt: {
				lte: date.plus({ days: lookAhead }).endOf("day").toJSDate(),
				gte: date.startOf("day").toJSDate(),
			},
		},
		include: {
			patient: true,
			service: {
				include: {
					service: true,
				},
			},
		},
	});

	return times(lookAhead).map((index) => {
		const d = date.plus({ days: index });
		return {
			date: d.toISODate()!,
			slots: times(10).map((index) => {
				const time = d
					.startOf("day")
					.plus({ hours: 8, minutes: agenda.slotInterval * index });
				const booking = bookings.find((booking) => {
					const bookedAt = DateTime.fromJSDate(booking.bookedAt);
					return (
						bookedAt.hasSame(time, "day") &&
						bookedAt.hasSame(time, "hour") &&
						bookedAt.hasSame(time, "minute")
					);
				});
				const available = booking == null;
				return {
					time: time.toISO()!,
					available,
					booking:
						booking != null && options?.includeBookings
							? {
									id: booking.id,
									patient: getDisplayName(booking.patient),
									service: booking.service.service.name,
									status: booking.status,
							  }
							: undefined,
				};
			}),
		};
	});
}
