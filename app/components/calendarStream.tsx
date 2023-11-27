import { DateTime } from "luxon";
import { useCallback, useRef, useState } from "react";
import { FixedSizeList as List } from "react-window";
import useDimensions from "react-cool-dimensions";

const NUMBER_OF_DAYS_TO_SHOW = 366;
const TODAY_INDEX = NUMBER_OF_DAYS_TO_SHOW / 2;

export default function CalendarStream(p: { className: string }) {
	const listRef = useRef<any>(null);
	const [currentIndex, setCurrentIndex] = useState(TODAY_INDEX);
	const date = dayFromIndex(TODAY_INDEX - currentIndex).toJSDate();

	const { observe, width } = useDimensions();
	const Item = useCallback(
		(p: { style: {}; index: number }) => {
			return (
				<DayItem
					onClick={setCurrentIndex}
					isActive={p.index === currentIndex}
					{...p}
				/>
			);
		},
		[currentIndex],
	);

	return (
		<div className={p.className}>
			<List
				ref={observe}
				height={88}
				itemCount={NUMBER_OF_DAYS_TO_SHOW}
				itemSize={100}
				layout="horizontal"
				width={width}
			>
				{Item}
			</List>
		</div>
	);
}

function dayFromIndex(index: number) {
	return DateTime.local().startOf("day").minus({ days: index });
}

function DayItem(p: {
	onClick: (index: number) => void;
	index: number;
	style: {};
	isActive: boolean;
}) {
	const index = TODAY_INDEX - p.index;
	const today = DateTime.local();
	const date = dayFromIndex(index);
	const endOfMonth = date.hasSame(date.endOf("month"), "day");
	const isFuture = date > today;
	const shortYear = date.year.toString().slice(2);
	const onClick = useCallback(() => p.onClick(p.index), [p.onClick, p.index]);
	return (
		<div
			onClick={onClick}
			className={`scroll-view-item ${endOfMonth && "end-of-month"} ${
				isFuture && "is-future"
			} ${p.isActive && "active"}`}
			style={p.style}
		>
			<div className="day">{date.day}</div>
			<div className="month-short">
				{date.monthShort} {shortYear}
			</div>
		</div>
	);
}
