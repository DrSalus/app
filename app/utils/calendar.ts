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
    date?: DateTime;
    includeBookings?: boolean;
  }
): Promise<CalendarSlot[]> {
  const lookAhead = options?.lookAhead ?? 1;
  const date = options?.date ?? DateTime.now();

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

  return times(lookAhead).map((index) => {
    const d = date.plus({ days: index });
    const dayOfWeek = d.weekday;
    const dailyPlan: TimeRange[] | null = get(
      plan,
      ["mon", "tue", "wed", "thu", "fri", "sat", "sun"][dayOfWeek - 1]
    );
    console.log(dailyPlan);
    let slots: DailyCalendarSlot[] = [];

    if (dailyPlan != null && dailyPlan.length > 0) {
      const singleSlot = dailyPlan[0];
      const from = DateTime.fromISO(singleSlot.from);
      const to = DateTime.fromISO(singleSlot.to);

      const numberOfSlots = Math.ceil(
        to.diff(from, "minutes").minutes / agenda.slotInterval
      );

      console.log("dailyPlan", dailyPlan, numberOfSlots);
      slots = times(numberOfSlots).map((index) => {
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
      });
    }

    return {
      date: d.toISODate()!,
      slots,
    };
  });
}
