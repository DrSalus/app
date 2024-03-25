import { MagnifyingGlassIcon } from "@heroicons/react/24/solid";
import { LoaderFunctionArgs } from "@remix-run/node";
import {
	Form,
	useNavigation,
	useParams,
	useSearchParams,
} from "@remix-run/react";
import { getPaginationState } from "~/components/pagination";
import { authenticator } from "~/services/auth.server";
import DoctorsTable from "~/tables/doctors";
import { db } from "~/utils/db.server";
import Patients from "./patients";
import PatientsTable from "~/tables/patients";

export async function loader({ request, params }: LoaderFunctionArgs) {
	const url = new URL(request.url);
	const query = url.searchParams.get("query") ?? "";

	const user = await authenticator.isAuthenticated(request, {
		failureRedirect: "/login",
	});

	const where = {
		bookings: {
			some: {
				service: {
					clinicId: params.id,
				},
			},
		},
		OR: [
			{
				firstName: {
					contains: query,
					mode: "insensitive",
				},
			},
			{
				lastName: {
					contains: query,
					mode: "insensitive",
				},
			},
			{
				fiscalCode: {
					contains: query,
					mode: "insensitive",
				},
			},
		],
	};
	const [queryParams, pagination] = await getPaginationState(
		request,
		db.patient.count({ where: { AND: [where] } }),
		20,
	);

	const patients = await db.patient.findMany({
		...queryParams,
		orderBy: [{ firstName: "asc" }, { lastName: "asc" }],
		where: {
			AND: [where],
		},
	});

	return { user, pagination, patients };
}

export default function ClinicDashboard() {
	return (
		<PatientsTable className="-mt-2" />
		// <Patients />
		// <div>
		// 	<div className="search-bar-container -mx-2">
		// 		<Form className="search-bar">
		// 			<input
		// 				type="text"
		// 				name="query"
		// 				defaultValue={search.get("query") ?? ""}
		// 				placeholder="Cerca per nome, codice fiscale o specializzazione..."
		// 			/>
		// 			<button type="submit">
		// 				<MagnifyingGlassIcon className="h-6 px-2 text-sky-800" />
		// 			</button>
		// 		</Form>
		// 	</div>
		// 	<DoctorsTable clinic={id} redirectTo={`/clinic/${id}/doctors`} />
		// </div>
	);
}
