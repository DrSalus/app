import { DateTime } from "luxon";
import { useCallback, useEffect, useRef, useState } from "react";
import { FixedSizeList as List } from "react-window";
import useDimensions from "react-cool-dimensions";
import classNames from "classnames";

const NUMBER_OF_DAYS_TO_SHOW = 366;
const TODAY_INDEX = NUMBER_OF_DAYS_TO_SHOW / 2;

export default function CalendarStream(props: {
	className?: string;
	date?: string | null;
	onChangeDate?: (date: Date) => void;
}) {
	const listRef = useRef<any>(null);
	const { date } = props;
	const [currentIndex, setCurrentIndex] = useState(TODAY_INDEX);

	useEffect(() => {
		const index = Math.ceil(
			DateTime.fromISO(date ?? "")
				.startOf("day")
				.diff(DateTime.now().startOf("day"), "days").days,
		);
		setCurrentIndex(NUMBER_OF_DAYS_TO_SHOW / 2 + index);
	}, [date]);

	const { observe, width } = useDimensions();
	const Item = useCallback(
		(p: { style: {}; index: number }) => {
			return (
				<DayItem
					key={p.index}
					onClick={(index) => {
						setCurrentIndex(index);
						const date = dayFromIndex(TODAY_INDEX - index).toJSDate();
						props.onChangeDate?.(date);
					}}
					isActive={p.index === currentIndex}
					{...p}
				/>
			);
		},
		[currentIndex],
	);
	// biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
	useEffect(() => {
		if (width !== 0) {
			listRef.current?.scrollToItem(currentIndex, "center");
		}
	}, [width]);
	return (
		<div ref={observe} className={classNames("", props.className)}>
			<List
				height={88}
				ref={listRef}
				itemCount={NUMBER_OF_DAYS_TO_SHOW}
				itemSize={100}
				layout="horizontal"
				width={width ?? 100}
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
			onKeyDown={onClick}
			style={p.style}
			className={classNames(
				"flex flex-col items-center justify-center border-b cursor-pointer",
				{
					"bg-primary": p.isActive,
					"hover:bg-gray-100": !p.isActive,
				},
			)}
		>
			<div
				className={classNames("text-primary text-2xl font-medium", {
					"text-primary": !p.isActive,
					"text-white": p.isActive,
				})}
			>
				{date.day}
			</div>
			<div
				className={classNames("text-sm", {
					"text-gray-200": p.isActive,
					"text-gray-500": !p.isActive,
				})}
			>
				{date.monthShort} {shortYear}
			</div>
			<div
				className={classNames("text-sm font-semibold", {
					"text-gray-100": p.isActive,
					"text-gray-600": !p.isActive,
				})}
			>
				{date.weekdayShort}
			</div>
		</div>
	);
}
