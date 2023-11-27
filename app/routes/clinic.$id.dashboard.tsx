import { LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { DateTime } from "luxon";
import Pagination from "~/components/pagination";
import ServiceTypeLabel, {
	ServiceTypeTag,
} from "~/components/serviceTypeLabel";
import { db } from "~/utils/db.server";
import { getDisplayName } from "~/utils/patient";

export async function loader({ request, params }: LoaderFunctionArgs) {
	const bookings = await db.serviceBooking.findMany({
		where: {
			agenda: {
				clinicId: params.id,
			},
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
	return { bookings };
}

export default function ClinicDashboard() {
	const { bookings } = useLoaderData<typeof loader>();
	return (
		<div className="flex flex-col">
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
