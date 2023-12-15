import { DateTime } from "luxon";
import { useCallback, useEffect, useRef, useState } from "react";
import { FixedSizeList as List } from "react-window";
import useDimensions from "react-cool-dimensions";
import classNames from "classnames";

const NUMBER_OF_DAYS_TO_SHOW = 366;
const TODAY_INDEX = NUMBER_OF_DAYS_TO_SHOW / 2;
export type Day = "mon" | "tue" | "wed" | "thu" | "fri" | "sat" | "sun";
export const DAYS: Day[] = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"];

export default function CalendarStream(props: {
	className?: string;
	date?: string | null;
	enabledDays?: Day[];
	onChangeDate?: (date: Date) => void;
}) {
	const listRef = useRef<any>(null);
	const { date, enabledDays } = props;
	const [currentIndex, setCurrentIndex] = useState(TODAY_INDEX);

	useEffect(() => {
		const index = Math.ceil(
			DateTime.fromISO(date ?? "")
				.startOf("day")
				.setLocale("Rome/Europe")
				.diff(DateTime.now().startOf("day"), "days").days,
		);
		setCurrentIndex(NUMBER_OF_DAYS_TO_SHOW / 2 + index);
	}, [date]);

	const { observe, width } = useDimensions();
	const Item = useCallback(
		(p: { style: {}; index: number }) => {
			const date = dayFromIndex(TODAY_INDEX - p.index);
			const day = DAYS[date.weekday - 1];
			const disabled = enabledDays != null && !enabledDays.includes(day);
			return (
				<DayItem
					key={p.index}
					onClick={(index) => {
						setCurrentIndex(index);
						props.onChangeDate?.(date.toJSDate());
					}}
					disabled={disabled}
					active={p.index === currentIndex}
					{...p}
				/>
			);
		},
		[currentIndex, enabledDays],
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
	disabled?: boolean;
	active: boolean;
}) {
	const index = TODAY_INDEX - p.index;
	const disabled = p.disabled ?? false;
	// const today = DateTime.local();
	const date = dayFromIndex(index);
	// const endOfMonth = date.hasSame(date.endOf("month"), "day");
	// const isFuture = date > today;
	const shortYear = date.year.toString().slice(2);
	const onClick = useCallback(() => p.onClick(p.index), [p.onClick, p.index]);
	return (
		<div
			onClick={onClick}
			onKeyDown={onClick}
			style={p.style}
			className={classNames(
				"flex flex-col items-center justify-center border-b",
				{
					"bg-primary": p.active,
					"hover:bg-gray-100": !p.active,
					"opacity-40 cursor-not-allowed": p.disabled,
					"cursor-pointer": !p.disabled,
				},
			)}
		>
			<div
				className={classNames("text-primary text-2xl font-medium", {
					"text-primary": !p.active && !disabled,
					"text-white": p.active,
					"text-gray-500": disabled,
				})}
			>
				{date.day}
			</div>
			<div
				className={classNames("text-sm", {
					"text-gray-200": p.active,
					"text-gray-500": !p.active,
				})}
			>
				{date.monthShort} {shortYear}
			</div>
			<div
				className={classNames("text-sm font-semibold", {
					"text-gray-100": p.active,
					"text-gray-600": !p.active,
				})}
			>
				{date.weekdayShort}
			</div>
		</div>
	);
}
