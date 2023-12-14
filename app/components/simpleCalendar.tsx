import { defaults, times } from "lodash-es";
import { DateTime } from "luxon";
import SmallDay from "./smallDay";
import { useState } from "react";
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/solid";
import classNames from "classnames";
import { BookingState } from "@prisma/client";
import React from "react";
import Show from "./show";
import Button from "./button";

export interface SimpleCalendarOptions {
	numberOfDays: number;
	numberOfSlots: number;
}

export interface CalendarSlot {
	date: string;
	slots: DailyCalendarSlot[];
}

export interface DailyCalendarSlot {
	time: string;
	available: boolean;
	hasPauseNext?: boolean;
	booking?: {
		id: string;
		status: BookingState;
		patient: string;
		service: string;
	};
}

export default function SimpleCalendar(p: {
	options?: SimpleCalendarOptions;
	onSelectSlot: (slot: DailyCalendarSlot) => void;
	selectedSlot: DailyCalendarSlot | null;
	slots: CalendarSlot[];
	lockPastSlots?: boolean;
	className?: string;
}) {
	const [page, setPage] = useState(0);
	const [showMore, setShowMore] = useState(false);
	const options: SimpleCalendarOptions = defaults(p.options ?? {}, {
		numberOfDays: 4,
		numberOfSlots: 4,
	});

	return (
		<div className={classNames("flex gap-x-4", p.className)}>
			<PageButton
				disabled={page === 0}
				direction="previous"
				onClick={() => setPage((p) => p - 1)}
			/>
			<div className="flex flex-col">
				<div className="flex gap-x-8">
					{times(options.numberOfDays).map((index) => {
						const day = p.slots[index + page * options.numberOfDays];
						if (day == null) {
							return <React.Fragment />;
						}
						const date = DateTime.fromISO(day.date)!;
						const numberOfSlots = showMore
							? day.slots.length
							: Math.min(day.slots.length, options.numberOfSlots);
						return (
							<div key={index} className="flex flex-col items-center">
								<SmallDay day={date} />
								<div className="text-gray-500 text-xs mb-4">
									{date.toLocaleString(
										{
											day: "2-digit",
											month: "short",
										},
										{
											locale: "it",
										},
									)}
								</div>
								<div className="flex flex-col gap-y-3 items-center">
									{times(numberOfSlots).map((index) => {
										const slot = day.slots[index];
										const time = DateTime.fromISO(slot.time).set({
											day: date.day,
											month: date.month,
											year: date.year,
										});
										const isPast = time < DateTime.now();
										const available = slot.available && !isPast;

										return (
											<React.Fragment key={index}>
												<div
													onClick={() =>
														available ? p.onSelectSlot(slot) : undefined
													}
													onKeyDown={() =>
														available ? p.onSelectSlot(slot) : undefined
													}
													className={classNames(" px-2 py-1 rounded", {
														"bg-opacity-100 text-white":
															p.selectedSlot?.time === slot.time,
														"bg-opacity-0 cursor-not-allowed text-gray-500 line-through":
															available === false,

														"bg-primary bg-opacity-10  text-primary font-medium hover:bg-primary hover:text-white cursor-pointer":
															available,
													})}
												>
													{time.toLocaleString(DateTime.TIME_SIMPLE, {
														locale: "it",
													})}
												</div>
											</React.Fragment>
										);
									})}
								</div>
							</div>
						);
					})}
				</div>
				<Button
					className="mt-4 font-normal"
					minimal
					text={showMore ? "Mostra Meno" : "Mostra altro"}
					onClick={() => setShowMore((p) => !p)}
				/>
			</div>
			<PageButton direction="next" onClick={() => setPage((p) => p + 1)} />
		</div>
	);
}

function PageButton(p: {
	disabled?: boolean;
	onClick: () => void;
	direction: "next" | "previous";
}) {
	return (
		<div
			onClick={p.disabled !== true ? p.onClick : undefined}
			onKeyDown={p.disabled !== true ? p.onClick : undefined}
			className={classNames(
				"flex flex-col justify-center px-2 text-gray-600 hover:text-primary rounded hover:bg-primary hover:bg-opacity-10 cursor-pointer",
				{
					"opacity-0": p.disabled,
				},
			)}
		>
			{p.direction === "next" ? (
				<ChevronRightIcon className="h-6" />
			) : (
				<ChevronLeftIcon className="h-6" />
			)}
		</div>
	);
}
