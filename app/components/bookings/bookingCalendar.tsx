import { useControlField, useField } from "remix-validated-form";
import CalendarField from "../fields/calendarField";
import { CalendarSlot } from "../simpleCalendar";
import { DateTime } from "luxon";
import React from "react";

export default function BookingCalendar(p: {
	className?: string;
	slots: CalendarSlot[];
}) {
	const [date] = useControlField<string | null>("date");
	if (date != null) {
		return <input type="hidden" name="date" value={date} />;
	}
	return <CalendarField className={p.className} name="date" slots={p.slots} />;
}
