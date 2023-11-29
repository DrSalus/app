import {
	CalendarDaysIcon,
	CheckBadgeIcon,
	CheckCircleIcon,
	CheckIcon,
	StopCircleIcon,
	XCircleIcon,
} from "@heroicons/react/24/solid";
import { BookingState, ServiceBooking } from "@prisma/client";
import classNames from "classnames";

export function BookingStatus(p: { booking: Pick<ServiceBooking, "status"> }) {
	let className = "";
	let text: string;
	let icon: JSX.Element;

	switch (p.booking.status) {
		case BookingState.BOOKED:
			icon = <CalendarDaysIcon className="h-4 w-4 text-gray-600" />;
			className = "bg-gray-300  text-gray-800 px-2";
			text = "Prenotata";
			break;
		case BookingState.CANCELLED:
			icon = <StopCircleIcon className="h-4 w-4" />;
			className = "bg-red-500  text-white px-2";
			text = "Annullata";
			break;
		case BookingState.COMPLETED:
			icon = <CheckBadgeIcon className="h-4 w-4" />;
			className = "bg-green-600  text-white";
			text = "Completata";
			break;
	}
	return (
		<div
			className={classNames(
				"rounded px-2 uppercase text-sm flex items-center gap-x-1",
				className,
			)}
		>
			{icon}
			<div>{text}</div>
		</div>
	);
}
