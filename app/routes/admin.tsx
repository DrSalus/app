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

export async function loader({ request }: LoaderFunctionArgs) {
	// If the user is already authenticated redirect to /dashboard directly
	const user = await authenticator.isAuthenticated(request, {
		failureRedirect: "/login",
	});

	return json({ user });
}

export default function Admion() {
	const { user } = useLoaderData<typeof loader>();

	return (
		<div className="flex flex-col">
			<DashboardHeader user={user} />
			<div className="grid grid-cols-5 gap-4 p-4">
				<HomeItem
					icon={<UserGroupIcon />}
					to="/patients"
					title="Gestione Pazienti"
				/>
				<HomeItem
					icon={<BuildingOfficeIcon />}
					to="/clinics"
					title="Gestione Strutture"
				/>
				<HomeItem
					icon={<ReceiptPercentIcon />}
					to="/clinicalServices"
					title="Gestione Prestazioni"
				/>
				<HomeItem
					icon={<DocumentArrowUpIcon />}
					to="/doctors"
					title="Gestione Dottori"
				/>
				<HomeItem icon={<UsersIcon />} to="/users" title="Gestione Utenti" />
			</div>
		</div>
	);
}
