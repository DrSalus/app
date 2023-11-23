import { defaults, times } from "lodash-es";
import { DateTime } from "luxon";
import SmallDay from "./smallDay";
import { useState } from "react";
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/solid";
import classNames from "classnames";

interface SimpleCalendarOptions {
	numberOfDays: number;
	numberOfSlots: number;
}

export default function SimpleCalendar(p: { options?: SimpleCalendarOptions }) {
	const [page, setPage] = useState(0);
	const options: SimpleCalendarOptions = defaults(
		{
			numberOfDays: 4,
			numberOfSlots: 4,
		},
		p.options ?? {},
	);

	const today = DateTime.now();
	return (
		<div className="flex gap-x-2">
			<PageButton
				disabled={page === 0}
				direction="previous"
				onClick={() => setPage((p) => p - 1)}
			/>
			<div className="flex gap-x-6">
				{times(options.numberOfDays).map((index) => {
					const date = today
						.plus({ days: index + page * options.numberOfDays })
						.startOf("day");
					return (
						<div className="flex flex-col items-center">
							<SmallDay day={date} />
							<div className="text-gray-500 text-xs mb-4">
								{date.toLocaleString({
									day: "2-digit",
									month: "short",
								})}
							</div>
							<div className="flex flex-col gap-y-3 items-center">
								{times(options.numberOfSlots).map((slot) => (
									<div className="bg-primary bg-opacity-10 text-primary font-medium px-2 py-1 rounded hover:bg-primary hover:text-white cursor-pointer">
										{date
											.set({
												hour: 8 + slot,
												minute: 0,
												second: 0,
											})
											.toLocaleString(DateTime.TIME_SIMPLE)}
									</div>
								))}
							</div>
						</div>
					);
				})}
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
