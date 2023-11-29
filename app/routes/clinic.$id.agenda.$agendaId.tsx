import { LoaderFunctionArgs, SerializeFrom } from "@remix-run/node";
import { useLoaderData, useNavigate, useSearchParams } from "@remix-run/react";
import { DateTime } from "luxon";
import { useState } from "react";
import { ClientOnly } from "remix-utils/client-only";
import AgendaDetail from "~/components/agenda/agendaDetail";
import CalendarStream from "~/components/calendarStream";
import { DailyAgendaView } from "~/components/dailyAgendaViewer";
import { authenticator } from "~/services/auth.server";
import { getCalendarSlots } from "~/utils/calendar";
import { db } from "~/utils/db.server";

export async function loader({ request, params }: LoaderFunctionArgs) {
	const user = await authenticator.isAuthenticated(request, {
		failureRedirect: "/login",
	});
	const url = new URL(request.url);
	const queryDate = url.searchParams.get("date");
	const bookingId = url.searchParams.get("bookingId");
	const agenda = await db.agenda.findUnique({
		where: {
			id: params.agendaId,
		},
		include: {
			doctor: true,
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
	const bookingId = searchParams.get("bookingId");

	return (
		<div className="flex flex-col items-stretch flex-grow -mt-4">
			<ClientOnly>
				{() => (
					<CalendarStream
						className="bg-white shadow-md"
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
			<div className="flex items-stretch mt-4 px-4 gap-x-2">
				<DailyAgendaView
					className="w-1/2"
					agenda={agenda}
					onSelectBooking={(id) => {
						setSearchParams((prev) => {
							if (id != null) {
								prev.set("bookingId", id);
							} else {
								prev.delete("bookingId");
							}
							return prev;
						});
					}}
					selectedBookingId={bookingId ?? null}
					calendar={slots[0]}
				/>
				<AgendaDetail agenda={agenda} booking={booking} className="w-1/2" />
			</div>
		</div>
	);
}
