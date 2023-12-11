import { CalendarDaysIcon } from "@heroicons/react/24/solid";
import { LoaderFunctionArgs, SerializeFrom } from "@remix-run/node";
import { useLoaderData, useNavigate, useSearchParams } from "@remix-run/react";
import { times } from "lodash-es";
import { DateTime } from "luxon";
import { useState } from "react";
import { ClientOnly } from "remix-utils/client-only";
import AgendaDetail from "~/components/agenda/agendaDetail";
import CalendarStream from "~/components/calendarStream";
import { DailyAgendaView } from "~/components/dailyAgendaViewer";
import NonIdealState from "~/components/nonIdealState";
import Show from "~/components/show";
import { DailyCalendarSlot } from "~/components/simpleCalendar";
import { authenticator } from "~/services/auth.server";
import { getCalendarSlots } from "~/utils/calendar";
import { db } from "~/utils/db.server";
import useStopPropagation from "~/utils/events";

export async function loader({ request, params }: LoaderFunctionArgs) {
	const user = await authenticator.isAuthenticated(request, {
		failureRedirect: "/login",
	});
	const url = new URL(request.url);
	const queryDate = url.searchParams.get("date");
	const slot = url.searchParams.get("slot");
	const agenda = await db.agenda.findUnique({
		where: {
			id: params.agendaId,
		},
		include: {
			doctor: true,
			plans: true,
			services: {
				include: {
					service: {
						select: {
							name: true,
						},
					},
				},
			},
		},
	});

	if (agenda == null) {
		throw new Error("Agenda not found");
	}

	const date = queryDate != null ? DateTime.fromISO(queryDate) : DateTime.now();
	console.log(queryDate, date.toISODate());
	const slots = await getCalendarSlots(agenda, {
		lookAhead: 1,
		date,
		includeBookings: true,
	});
	const bookingId =
		slot != null
			? slots[0].slots.find((d) => d.time === slot)?.booking?.id
			: null;

	const booking =
		bookingId != null
			? await db.serviceBooking.findUnique({
					where: { id: bookingId },
					include: {
						patient: true,
						service: {
							include: {
								service: true,
								doctor: true,
							},
						},
					},
			  })
			: null;

	return { agenda, slots, booking, date: date.toISODate() };
}

export type Response = SerializeFrom<typeof loader>;
export type AgendaBooking = Response["booking"];

export default function AgendaPage() {
	const { agenda, slots, date, booking } = useLoaderData<typeof loader>();
	const [searchParams, setSearchParams] = useSearchParams();
	const slot = searchParams.get("slot");
	const selectedSlot = slots[0].slots.find((d) => d.time === slot);
	const hasSlots = slots[0].slots.length > 0;
	return (
		<div className="flex flex-col items-stretch flex-grow -mt-4 min-h-0">
			<ClientOnly>
				{() => (
					<CalendarStream
						className="bg-white shadow-md sticky top-0 z-10"
						onChangeDate={(date) => {
							setSearchParams((prev) => {
								prev.set("date", date.toISOString());
								return prev;
							});
						}}
						date={date}
					/>
				)}
			</ClientOnly>
			<div className="flex items-start mt-4 px-4 gap-x-2 flex-grow pb-4">
				<Show if={hasSlots}>
					<DailyAgendaView
						className="w-1/2 overflow-scroll max-h-[74vh]"
						agenda={agenda}
						onSelectSlot={(slot) => {
							setSearchParams((prev) => {
								if (slot != null) {
									prev.set("slot", slot?.time);
								} else {
									prev.delete("slot");
								}
								return prev;
							});
						}}
						selectedSlot={selectedSlot}
						calendar={slots[0]}
					/>
				</Show>
				<Show unless={hasSlots}>
					<div className="rounded-lg w-1/2 border shadow bg-white flex flex-col items-center relative py-4 min-h-0">
						<NonIdealState
							title="Agenda Non Disponibile"
							description="Per questo giorno non è disponibile alcuno slot, controlla la configurazione della agenda."
							icon={<CalendarDaysIcon />}
						/>
					</div>
				</Show>
				<AgendaDetail
					slot={slot}
					agenda={agenda}
					booking={booking}
					className="w-1/2"
				/>
			</div>
		</div>
	);
}
