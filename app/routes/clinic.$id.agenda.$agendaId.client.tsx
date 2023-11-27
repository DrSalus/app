import { LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import CalendarStream from "~/components/calendarStream";
import { DailyAgendaView } from "~/components/dailyAgendaViewer";
import { authenticator } from "~/services/auth.server";
import { getCalendarSlots } from "~/utils/calendar";
import { db } from "~/utils/db.server";

export async function loader({ request, params }: LoaderFunctionArgs) {
	const user = await authenticator.isAuthenticated(request, {
		failureRedirect: "/login",
	});
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

	const slots = await getCalendarSlots(agenda, {
		lookAhead: 1,
		includeBookings: true,
	});

	return { agenda, slots };
}

export default function AgendaDetail() {
	const { agenda, slots } = useLoaderData<typeof loader>();
	return (
		<div className="flex items-stretch flex-grow mb-4 px-4">
			<CalendarStream />
			<DailyAgendaView className="w-1/2" agenda={agenda} calendar={slots[0]} />
		</div>
	);
}
