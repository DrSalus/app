import { MagnifyingGlassIcon } from "@heroicons/react/24/solid";
import { LoaderFunctionArgs } from "@remix-run/node";
import { Form, useLoaderData, useSearchParams } from "@remix-run/react";
import { DateTime } from "luxon";
import Button from "~/components/button";
import Pagination, { getPaginationState } from "~/components/pagination";
import ServiceTypeLabel, {
	ServiceTypeTag,
} from "~/components/serviceTypeLabel";
import { db } from "~/utils/db.server";
import { getDisplayName } from "~/utils/patient";

export async function loader({ request, params }: LoaderFunctionArgs) {
	const url = new URL(request.url);
	const query = url.searchParams.get("query") ?? "";

	const [queryParams, pagination] = await getPaginationState(
		request,
		db.serviceBooking.count({
			where: {
				agenda: {
					clinicId: params.id,
				},
			},
		}),
		20,
	);
	const bookings = await db.serviceBooking.findMany({
		...queryParams,
		orderBy: [{ bookedAt: "desc" }],
		where: {
			AND: [
				{
					agenda: {
						clinicId: params.id,
					},
				},
				{
					OR: [
						{
							patient: {
								firstName: {
									contains: query,
									mode: "insensitive",
								},
							},
						},
						{
							patient: {
								lastName: {
									contains: query,
									mode: "insensitive",
								},
							},
						},
						{
							service: {
								service: {
									name: {
										contains: query,
										mode: "insensitive",
									},
								},
							},
						},
					],
				},
			],
		},
		include: {
			patient: true,
			service: {
				include: {
					service: true,
				},
			},
		},
	});
	console.log(pagination);
	return { bookings, pagination };
}

export default function ClinicDashboard() {
	const { bookings } = useLoaderData<typeof loader>();
	const [search] = useSearchParams();
	return (
		<div className="flex flex-col">
			<div className="search-bar-container -mx-2">
				<Form className="search-bar">
					<input
						type="text"
						name="query"
						defaultValue={search.get("query") ?? ""}
						placeholder="Cerca per nome o prestazione..."
					/>
					<button type="submit">
						<MagnifyingGlassIcon className="h-6 px-2 text-sky-800" />
					</button>
				</Form>
			</div>
			<div className="table mx-4">
				<table>
					<thead>
						<tr>
							<th className="">Paziente</th>
							<th className="">Tipo</th>
							<th className="">Prestazione</th>
							<th className="">Orario</th>
							<th className="w-2">Azioni</th>
						</tr>
					</thead>
					<tbody>
						{bookings.map((u) => (
							<tr key={u.id}>
								<td className="">{getDisplayName(u.patient)}</td>
								<td className="">
									<div className="flex items-center">
										<ServiceTypeTag type={u.service.service.type} />
									</div>
								</td>

								<td className="">{u.service.service.name}</td>
								<td className="">
									{DateTime.fromISO(u.bookedAt).toLocaleString(
										DateTime.DATETIME_MED,
									)}
								</td>
								<td className="flex gap-x-2"></td>
							</tr>
						))}
					</tbody>
				</table>
			</div>
			<Pagination />
		</div>
	);
}
