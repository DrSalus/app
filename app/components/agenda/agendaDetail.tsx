import type { Agenda } from "@prisma/client";
import classNames from "classnames";
import { DateTime } from "luxon";
import React from "react";
import type { AgendaBooking } from "~/routes/clinic.$id.agenda.$agendaId";
import type { WithSerializedTypes } from "~/utils/client";
import { getDisplayName } from "~/utils/patient";
import { BookingStatus } from "../bookings/bookingStatus";
import { DocumentDuplicateIcon } from "@heroicons/react/20/solid";
import {
	PlayCircleIcon,
	WrenchIcon,
	PlusCircleIcon,
	XCircleIcon,
} from "@heroicons/react/24/solid";
import { useDialog } from "~/utils/dialog";
import { AgendaAcceptDialog } from "../../dialogs/agendaAcceptDialog";
import { ClientOnly } from "remix-utils/client-only";
import { AgendaCancellationDialog } from "~/dialogs/agendaCancellationDialog";
import type { AgendaWithPlans } from "~/dialogs/agenda";
import { AgendaDialog } from "~/dialogs/agenda";
import { BookingDialog } from "~/dialogs/bookingDialog";
import { DailyCalendarSlot } from "../simpleCalendar";

export default function AgendaDetail(p: {
	agenda: WithSerializedTypes<AgendaWithPlans>;
	slot?: string | null;
	className?: string;
	booking?: AgendaBooking;
}) {
	return (
		<div className={classNames("bg-white rounded border shadow", p.className)}>
			{p.booking != null ? (
				<AgendaBookingDetail {...p} booking={p.booking} />
			) : (
				<AgendaDetailEmpty {...p} />
			)}
		</div>
	);
}

function AgendaBookingDetail(p: {
	agenda: WithSerializedTypes<Agenda>;
	className?: string;
	booking: NonNullable<AgendaBooking>;
}) {
	const intl = new Intl.NumberFormat("it-IT", {
		style: "currency",
		currency: "EUR",
	});

	const [
		isAcceptDialogOpen,
		acceptBooking,
		openAcceptDialog,
		closeAcceptDialog,
	] = useDialog<AgendaBooking | null>();
	const [
		isCancelDialogOpen,
		cancelBooking,
		openCancellationDialog,
		cancelAcceptDialog,
	] = useDialog<AgendaBooking | null>();
	return (
		<div className="flex flex-col divide-y">
			<AgendaBookingField
				label="Stato Prenotazione"
				value={<BookingStatus booking={p.booking} />}
			/>
			<AgendaBookingField
				label="Paziente"
				value={getDisplayName(p.booking.patient)}
			/>
			<AgendaBookingField
				label="Data Prenotazione"
				value={
					<div className="flex gap-x-4">
						<div>
							{DateTime.fromISO(p.booking.bookedAt).toLocaleString(
								DateTime.DATETIME_MED,
							)}
						</div>
						<div className="flex items-center">
							<div>{p.booking.duration}</div>
							<div className="px-1 text-gray-500">min</div>
						</div>
					</div>
				}
			/>
			{p.booking.service.doctor != null ? (
				<AgendaBookingField
					label="Dottore"
					value={getDisplayName(p.booking.service.doctor)}
				/>
			) : (
				<React.Fragment />
			)}
			<AgendaBookingField
				label="Prestazione"
				value={p.booking.service.service.name}
			/>
			<AgendaBookingField
				label="Totale Dovuto"
				value={intl.format(p.booking.service.amount)}
			/>
			<AgendaQuickActionsGrid>
				<AgendaQuickAction
					title="Accettazione"
					icon={<PlayCircleIcon className="h-12 group-hover:text-green-600" />}
					onClick={() => openAcceptDialog(p.booking)}
				/>
				<ClientOnly>
					{() => (
						<>
							<AgendaAcceptDialog
								isOpen={isAcceptDialogOpen}
								booking={acceptBooking}
								redirectTo={window.location.pathname + window.location.search}
								onClose={closeAcceptDialog}
							/>
							<AgendaCancellationDialog
								isOpen={isCancelDialogOpen}
								booking={cancelBooking}
								redirectTo={window.location.pathname + window.location.search}
								onClose={cancelAcceptDialog}
							/>
						</>
					)}
				</ClientOnly>
				<AgendaQuickAction
					title="Sposta"
					icon={
						<DocumentDuplicateIcon className="h-12 group-hover:text-primary" />
					}
				/>
				<AgendaQuickAction
					title="Annulla"
					icon={<XCircleIcon className="h-12  group-hover:text-red-600" />}
					onClick={() => openCancellationDialog(p.booking)}
				/>
			</AgendaQuickActionsGrid>
		</div>
	);
}

function AgendaQuickAction(p: {
	title: string;
	icon: JSX.Element;
	onClick?: () => void;
}) {
	return (
		<div
			className="flex group hover:bg-gray-50 rounded-lg flex-col items-center gap-y-1 py-4 px-2 cursor-pointer"
			onClick={p.onClick}
			onKeyDown={p.onClick}
		>
			<div className="h-12 text-gray-400">{p.icon}</div>
			<div className="group-hover:font-medium">{p.title}</div>
		</div>
	);
}

function AgendaQuickActionsGrid(p: { children: JSX.Element | JSX.Element[] }) {
	return (
		<div className="flex-grow grid grid-cols-3 gap-2 py-4 px-4">
			{p.children}
		</div>
	);
}

function AgendaBookingField(p: { label: string; value: string | JSX.Element }) {
	return (
		<div className="flex px-4 py-1.5 items-center ">
			<div className="text-gray-500 w-48">{p.label}</div>
			<div className="">{p.value}</div>
		</div>
	);
}

function AgendaDetailEmpty(p: {
	agenda: WithSerializedTypes<AgendaWithPlans>;
	className?: string;
	slot?: string | null;
}) {
	const [isAgendaOpen, agenda, openAgenda, closeAgendaDialog] = useDialog();
	const [isBookingOpen, _, openBooking, closeBookingDialog] = useDialog();
	return (
		<div className="flex flex-col divide-y">
			<AgendaQuickActionsGrid>
				<AgendaQuickAction
					title="Nuova Prenotazione"
					icon={<PlusCircleIcon className="h-12 group-hover:text-primary" />}
					onClick={() => openBooking()}
				/>
				<AgendaQuickAction
					title="Gestisci Agenda"
					icon={<WrenchIcon className="h-12 group-hover:text-primary" />}
					onClick={() => openAgenda(p.agenda)}
				/>
				<AgendaDialog
					isOpen={isAgendaOpen}
					agenda={p.agenda}
					clinicId={p.agenda.clinicId}
					onClose={closeAgendaDialog}
					source="agenda"
				/>
				<ClientOnly>
					{() => (
						<BookingDialog
							isOpen={isBookingOpen}
							agenda={p.agenda}
							slot={p.slot}
							redirectTo={window.location.pathname + window.location.search}
							onClose={closeBookingDialog}
						/>
					)}
				</ClientOnly>
			</AgendaQuickActionsGrid>
		</div>
	);
}
