import { Agenda, BookingState, Doctor } from "@prisma/client";
import classNames from "classnames";
import { WithSerializedTypes } from "~/utils/client";
import { getDisplayName } from "~/utils/patient";
import { CalendarSlot, DailyCalendarSlot } from "./simpleCalendar";
import { DateTime } from "luxon";
import React from "react";
import {
	CalendarDaysIcon,
	CheckCircleIcon,
	StopCircleIcon,
} from "@heroicons/react/24/solid";

export function DailyAgendaView(p: {
	className?: string;
	selectedBookingId?: string | null;
	agenda: WithSerializedTypes<
		Agenda & { doctor?: WithSerializedTypes<Doctor> }
	>;
	onSelectBooking?: (bookingId: string | null) => void;
	calendar: CalendarSlot;
}) {
	return (
		<div
			className={classNames(
				"rounded-lg  border shadow bg-white flex flex-col items-center relative py-4",
				p.className,
			)}
		>
			<div className="text-xl font-normal text-gray-800">{p.agenda.name}</div>
			<div className="text-sm text-gray-500">
				{p.agenda.doctor != null ? getDisplayName(p.agenda.doctor) : ""}
			</div>
			<div className="py-4 flex-grow flex flex-col gap-y-2 items-stretch w-full relative">
				{p.calendar.slots.map((slot, i) => {
					const isSelected =
						slot.booking?.id != null &&
						slot.booking?.id === p.selectedBookingId;
					return (
						<div
							onKeyDown={() => p.onSelectBooking?.(slot.booking?.id ?? null)}
							onClick={() => p.onSelectBooking?.(slot.booking?.id ?? null)}
							className={classNames(
								"h-16  border cursor-pointer flex items-center mx-4 px-4 rounded",
								{
									"bg-gray-50 hover:bg-gray-100": slot.available && !isSelected,
									"bg-blue-100 bg-opacity-40  border-primary border-2 border-opacity-30":
										!slot.available && !isSelected,
									"bg-primary": isSelected,
								},
							)}
						>
							<div className="flex-grow flex items-center">
								{slot.booking != null ? (
									<>
										<div className="pr-4">
											<BookingStatusIcon status={slot.booking.status} />
										</div>
										<div className="flex flex-col">
											<div
												className={classNames({
													"text-white font-bold": !slot.available && isSelected,
													"text-primary font-bold":
														!slot.available && !isSelected,
												})}
											>
												{slot.booking.patient}
											</div>
											<div
												className={classNames("text-sm", {
													"text-gray-100": !slot.available && isSelected,
													"text-gray-600": !slot.available && !isSelected,
												})}
											>
												{slot.booking.service}
											</div>
										</div>
									</>
								) : (
									<React.Fragment />
								)}
							</div>
							<div
								className={classNames("text-lg text-gray-800", {
									"text-primary font-medium": !slot.available && !isSelected,
									"text-white font-medium": !slot.available && isSelected,
									"text-gray-400": slot.available,
								})}
							>
								{DateTime.fromISO(slot.time).toLocaleString(
									DateTime.TIME_SIMPLE,
								)}
							</div>
						</div>
					);
				})}
			</div>
		</div>
	);
}

function BookingStatusIcon(p: { status: BookingState; className?: string }) {
	if (p.status === BookingState.CANCELLED) {
		return <StopCircleIcon className="h-8 text-red-200" />;
	}
	if (p.status === BookingState.COMPLETED) {
		return <CheckCircleIcon className="h-8 text-primary" />;
	}

	return <CalendarDaysIcon className="h-8 text-gray-400" />;
}
