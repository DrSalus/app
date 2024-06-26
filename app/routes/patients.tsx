import type { LoaderFunctionArgs } from "@remix-run/node";
import { getPaginationState } from "~/components/pagination";
import { authenticator } from "~/services/auth.server";
import PatientsTable from "~/tables/patients";
import { db } from "~/utils/db.server";

export async function loader({ request }: LoaderFunctionArgs) {
	const url = new URL(request.url);
	const query = url.searchParams.get("query") ?? "";

	const user = await authenticator.isAuthenticated(request, {
		failureRedirect: "/login",
	});

	const [queryParams, pagination] = await getPaginationState(
		request,
		db.patient.count(),
		20,
	);

	const patients = await db.patient.findMany({
		...queryParams,
		orderBy: [{ firstName: "asc" }, { lastName: "asc" }],
		where: {
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
		},
	});

	return { user, pagination, patients };
}

export default function Patients() {
	return <PatientsTable />;
}
