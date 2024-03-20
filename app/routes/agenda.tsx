import { authenticator } from "~/services/auth.server";
import { json, type LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { DateTime } from "luxon";
import { LinkButton } from "~/components/button";
import {
	ArrowRightOnRectangleIcon,
	BuildingOfficeIcon,
	ReceiptPercentIcon,
	UserCircleIcon,
	UserGroupIcon,
	UsersIcon,
	WrenchIcon,
} from "@heroicons/react/24/solid";
import HomeItem from "~/components/homeItem";
import { DocumentArrowUpIcon } from "@heroicons/react/24/solid";
import DashboardHeader from "~/components/dashboardHeader";
import { loader as agendaLoader } from "~/services/agendas";
import { db } from "~/utils/db.server";
import AgendaDetail from "~/components/agenda/agendaDetail";
import AgendaManager from "~/components/agenda/agendaManager";
import Header from "~/components/header";

export async function loader({ request, ...other }: LoaderFunctionArgs) {
	// If the user is already authenticated redirect to /dashboard directly
	const user = await authenticator.isAuthenticated(request, {
		failureRedirect: "/login",
	});

	const agendas = await db.agenda.findMany({
		where: {
			users: {
				some: {
					id: user.id,
				},
			},
		},
	});

	const agendaId = agendas?.[0].id;
	return agendaLoader({ request, ...other, params: { agendaId } });
}

export default function Dashboard() {
	const { user, agenda } = useLoaderData<typeof loader>();

	return (
		<div className="flex flex-col -mt-3">
			<Header title={agenda.name} description={agenda.clinic.name} />
			<AgendaManager />
		</div>
	);
}
