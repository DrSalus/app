import { LoaderFunctionArgs, redirect } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import SimpleCalendar from "~/components/simpleCalendar";
import { authenticator } from "~/services/auth.server";
import { db } from "~/utils/db.server";

export async function loader({ request, params }: LoaderFunctionArgs) {
	const user = await authenticator.isAuthenticated(request, {
		failureRedirect: "/login",
	});

	const agenda = await db.agenda.findUnique({
		where: { id: params.agendaId },
		include: {
			clinic: true,
			doctor: true,
			services: {
				include: {
					service: true,
				},
			},
		},
	});
	if (agenda == null) {
		return redirect("/dashboard");
	}
	return { user, agenda };
}

export default function ClinicBooking() {
	const { agenda } = useLoaderData<typeof loader>();
	return (
		<div className="flex flex-col items-center bg-white rounded-lg mx-4 my-1 border shadow-xl">
			<div className="text-3xl text-primary font-bold mt-4">
				{agenda.clinic.name}
			</div>
			<div className="text-base">
				{agenda.clinic.address} {agenda.clinic.city}
			</div>

			<div className="mt-8">
				<SimpleCalendar />
			</div>
		</div>
	);
}
