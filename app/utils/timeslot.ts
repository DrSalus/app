import { Course } from "@prisma/client";
import { DateTime } from "luxon";
import { Day } from "~/components/daysOfWeek";

export function checkIfIsInSlot(course?: Partial<Course>): boolean {
  const startDay = DateTime.local({
    zone: "Europe/Rome",
  }).startOf("day");
  const now = DateTime.local({
    zone: "Europe/Rome",
  });
  const currentWeekDayNumber = DateTime.local({
    zone: "Europe/Rome",
  }).weekday;
  const availableDays: Day[] = JSON.parse(
    course?.daysOfWeek ??
      `[
        {
          "label": "Lun",
          "value": "1"
        },
        {
          "label": "Mar",
          "value": "2"
        },
        {
          "label": "Mer",
          "value": "3"
        },
        {
          "label": "Gio",
          "value": "4"
        },
        {
          "label": "Ven",
          "value": "5"
        }
      ]`
  );

  const timeSlot = course?.timeSlot?.split(";") ?? ["00:00", "23:59"];
  const [slotStartDate, slotEndDate] = timeSlot.map((d) => {
    const [hours, minutes] = d.split(":");
    return startDay.plus({
      hours: parseInt(hours),
      minutes: parseInt(minutes),
    });
  });


  return (
    now >= slotStartDate &&
    now <= slotEndDate &&
    availableDays.some((d) => d.value === currentWeekDayNumber.toString())
  );
}
