import { useControlField, useField } from "remix-validated-form";
import CalendarField from "../fields/calendarField";
import { CalendarSlot } from "../simpleCalendar";
import { DateTime } from "luxon";
import React from "react";
import { CalendarDaysIcon } from "@heroicons/react/24/solid";

export default function BookingCalendar(p: {
	className?: string;
	slots: CalendarSlot[];
}) {
	const [date, setDate] = useControlField<string | null>("date");
	if (date != null) {
		return (
			<div
				className="bg-gray-50 flex items-center border-b gap-x-4 text-lg text-gray-700 py-4 px-4 hover:bg-slate-100 cursor-pointer"
				onClick={() => setDate(null)}
			>
				<CalendarDaysIcon className="h-10 text-gray-400" />
				<div className="flex-grow">
					{DateTime.fromISO(date).toLocaleString(DateTime.DATE_HUGE)}
				</div>
				<div className="text-primary font-semibold">
					{DateTime.fromISO(date).toLocaleString(DateTime.TIME_SIMPLE)}
				</div>
				<input type="hidden" name="date" value={date} />
			</div>
		);
	}
	return (
		<CalendarField
			className={p.className}
			name="date"
			slots={p.slots}
			options={{
				numberOfDays: 5,
				numberOfSlots: 10,
			}}
		/>
	);
}
