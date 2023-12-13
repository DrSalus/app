import { BookOpenIcon, CalendarDaysIcon } from "@heroicons/react/24/solid";
import { LoaderFunctionArgs, json } from "@remix-run/node";
import Background from "~/components/background";
import NonIdealState from "~/components/nonIdealState";
import { authenticator } from "~/services/auth.server";
import { db } from "~/utils/db.server";

export async function loader({ request, params }: LoaderFunctionArgs) {
	const booking = await db.serviceBooking.findUnique({
		where: {
			id: params.id,
		},
	});
	return json({ booking });
}

export default function BookingConfirmed() {
	return (
		<Background className="flex items-center justify-center">
			<div className="bg-white rounded-xl shadow border z-20">
				<NonIdealState
					icon={<CalendarDaysIcon className="h-16 stroke-primary" />}
					title="Prenotazione confermata"
					description="Riceverai una mail ed un SMS di conferma con tutti i dettagli della prenotazione."
				/>
			</div>
		</Background>
	);
}
