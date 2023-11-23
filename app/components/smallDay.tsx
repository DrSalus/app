import { DateTime, Info } from "luxon";

export default function SmallDay(p: { day: DateTime }) {
	const today = DateTime.now();
	const isToday = p.day.hasSame(today, "day");
	const isTomorrow = p.day.hasSame(today.plus({ days: 1 }), "day");

	const weekdays = Info.weekdays("short");

	if (isToday) {
		return <div className="flex flex-col">Oggi</div>;
	}
	if (isTomorrow) {
		return <div className="flex flex-col">Domani</div>;
	}

	return <div className="flex flex-col">{weekdays[p.day.weekday - 1]}</div>;
}
