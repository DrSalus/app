import {
	CalendarDaysIcon,
	CalendarIcon,
	DocumentArrowUpIcon,
	GlobeAmericasIcon,
	HomeIcon,
	ReceiptPercentIcon,
} from "@heroicons/react/24/solid";
import { LoaderFunctionArgs, redirect } from "@remix-run/node";
import { Outlet, useLoaderData } from "@remix-run/react";
import { useState } from "react";
import Header from "~/components/header";
import NavigationHeader from "~/components/navigationHeader";
import { authenticator } from "~/services/auth.server";
import { db } from "~/utils/db.server";

export async function loader({ request, params }: LoaderFunctionArgs) {
	const user = await authenticator.isAuthenticated(request, {
		failureRedirect: "/login",
	});

	let id: string | null = params.id ?? null;
	if (id == null) {
		id = user.clinicId;
	}

	const clinic = await db.clinic.findUnique({ where: { id } });
	if (clinic == null) {
		return redirect("/");
	}
	return { user, clinic };
}

export default function Clinic() {
	const { clinic } = useLoaderData<typeof loader>();

	return (
		<div className="page">
			<div className="headed-card">
				<NavigationHeader
					title={clinic.name}
					baseLocation={`/clinic/${clinic.id}/`}
					description={clinic.address}
					tabs={[
						{
							id: "home",
							title: "Home",
							icon: <HomeIcon />,
						},
						{
							id: "agendas",
							title: "Agende",
							icon: <CalendarDaysIcon />,
						},
						{ id: "doctors", title: "Dottori", icon: <DocumentArrowUpIcon /> },
						{
							id: "services",
							title: "Prestazioni",
							icon: <ReceiptPercentIcon />,
						},
					]}
				/>
			</div>
			<Outlet />
		</div>
	);
}
