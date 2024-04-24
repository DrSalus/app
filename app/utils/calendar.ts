import { CalendarSlot, DailyCalendarSlot } from "~/components/simpleCalendar";
import { db } from "./db.server";
import {
	Agenda,
	ClinicalService,
	Patient,
	ServiceOffering,
} from "@prisma/client";
import { WithSerializedTypes } from "./client";
import { DateTime } from "luxon";
import { get, times } from "lodash-es";
import { getDisplayName } from "./patient";

interface TimeRange {
	from: string;
	to: string;
}

export async function getCalendarSlots(
	agenda: Agenda,
	options?: {
		lookAhead?: number;
		maxLookAhead?: number;
		date?: DateTime;
		includeBookings?: boolean;
		ignoreEmptyDays?: boolean;
	},
): Promise<CalendarSlot[]> {
	const lookAhead = options?.lookAhead ?? 1;
	const maxLookAhead = options?.maxLookAhead ?? 30;
	const date = (options?.date ?? DateTime.now()).setZone("Europe/Rome");

	const plan = await db.agendaPlan.findFirst({
		where: { agendaId: agenda.id },
	});

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

	let results: CalendarSlot[] = [];
	let index = 0;

	do {
		const d = date.plus({ days: index });
		const dayOfWeek = d.weekday;
		const dailyPlan: TimeRange[] | null = get(
			plan,
			["mon", "tue", "wed", "thu", "fri", "sat", "sun"][dayOfWeek - 1],
		);
		let slots: DailyCalendarSlot[] = [];

		const validFrom = DateTime.fromJSDate(
			agenda.validFrom ?? new Date(0),
		).startOf("day");
		const validUntil =
			agenda.validUntil != null
				? DateTime.fromJSDate(agenda.validUntil).endOf("day")
				: null;

		if (dailyPlan != null && dailyPlan.length > 0) {
			for (const [slotIndex, singleSlot] of dailyPlan.entries()) {
				const from = DateTime.fromISO(singleSlot.from);
				const to = DateTime.fromISO(singleSlot.to);

				const numberOfSlots = Math.ceil(
					to.diff(from, "minutes").minutes / agenda.slotInterval,
				);

				const nextSlots = times(numberOfSlots).map((index) => {
					const time = d.startOf("day").plus({
						hours: from.hour,
						minutes: from.minute + agenda.slotInterval * index,
					});
					const booking = bookings.find((booking) => {
						const bookedAt = DateTime.fromJSDate(booking.bookedAt);
						return (
							bookedAt.hasSame(time, "day") &&
							bookedAt.hasSame(time, "hour") &&
							bookedAt.hasSame(time, "minute")
						);
					});
					const isValidFrom = time >= validFrom;
					const isValidUntil = validUntil == null || time <= validUntil;
					const available = booking == null && isValidFrom && isValidUntil;
					console.log(booking == null, isValidFrom, isValidUntil);
					return {
						time: time.toISO()!,
						available,
						hasPauseNext:
							numberOfSlots - 1 === index && slotIndex < dailyPlan.length - 1,
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
				});

				slots = [...slots, ...nextSlots];
			}
			results.push({
				date: d.toISODate()!,
				slots,
			});
		} else if (!(options?.ignoreEmptyDays ?? false)) {
			results.push({
				date: d.toISODate()!,
				slots: [],
			});
		}

		index++;
	} while (results.length < lookAhead && index < maxLookAhead);

	return results;
}
