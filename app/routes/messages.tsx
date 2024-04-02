import {
	CheckCircleIcon,
	ExclamationTriangleIcon,
} from "@heroicons/react/24/solid";
import { UserKind } from "@prisma/client";
import type { LoaderFunctionArgs } from "@remix-run/node";
import { redirect, useLoaderData } from "@remix-run/react";
import { DateTime } from "luxon";
import Header from "~/components/header";
import Pagination, { getPaginationState } from "~/components/pagination";
import { authenticator } from "~/services/auth.server";
import { db } from "~/utils/db.server";
import { getDisplayName } from "~/utils/patient";

export async function loader({ request }: LoaderFunctionArgs) {
	const url = new URL(request.url);
	const query = url.searchParams.get("query") ?? "";

	const user = await authenticator.isAuthenticated(request, {
		failureRedirect: "/login",
	});

	if (user.kind !== UserKind.ADMIN) {
		return redirect("/");
	}

	const [queryParams, pagination] = await getPaginationState(
		request,
		db.message.count(),
		20,
	);
	const messages = await db.message.findMany({
		...queryParams,
		include: {
			booking: {
				include: {
					agenda: {
						select: { name: true },
					},
					patient: true,
					service: {
						include: {
							service: {
								select: {
									name: true,
								},
							},
						},
					},
				},
			},
		},
		orderBy: [{ createdAt: "desc" }],
	});

	return { user, pagination, messages };
}

export default function Clinics() {
	const { messages } = useLoaderData<typeof loader>();

	return (
		<div className="page">
			<div className="headed-card">
				<Header title="Messaggi" />
			</div>
			<div className="table mx-4">
				<table>
					<thead>
						<tr>
							<th className="w-28">Stato</th>
							<th>Tipo</th>
							<th className="">Paziente</th>
							<th className="">Telefono</th>
							<th className="">Prestazione</th>
							<th className="">Agenda</th>
							<th className="">Data</th>
							<th>Dettagli</th>
						</tr>
					</thead>
					<tbody>
						{messages.map((u) => (
							<tr key={u.id}>
								<td>
									{u.errorMessage == null ? (
										<div className="bg-green-100 flex items-center px-2  font-medium text-green-800">
											<CheckCircleIcon className="mr-2 h-3.5 mt-0.5" />
											<div className="text-sm uppercase">Inviato</div>
										</div>
									) : (
										<div className="bg-orange-100 flex items-center px-2  font-medium  text-orange-800">
											<ExclamationTriangleIcon className="mr-2 h-3.5 mt-0.5" />
											<div className="text-sm uppercase">Errore</div>
										</div>
									)}
								</td>
								<td>{u.kind}</td>
								<td className="font-medium">
									{getDisplayName(u.booking.patient)}
								</td>
								<td className="">{u.recipient}</td>
								<td className="">{u.booking.service.service.name}</td>
								<td className="">{u.booking.agenda.name}</td>
								<td>
									{DateTime.fromISO(u.createdAt).toLocaleString(
										DateTime.DATETIME_MED,
									)}
								</td>
								<td className="italic">{u.errorMessage}</td>
							</tr>
						))}
					</tbody>
				</table>
			</div>
			<Pagination />
		</div>
	);
}
