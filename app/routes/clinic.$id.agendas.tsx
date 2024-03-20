import type { LoaderFunctionArgs } from "@remix-run/node";
import { useParams, useSearchParams } from "@remix-run/react";
import { getPaginationState } from "~/components/pagination";
import AgendasTable from "~/tables/agendas";
import { db } from "~/utils/db.server";
import { Form, redirect, useLoaderData, useNavigate } from "@remix-run/react";
import { MagnifyingGlassIcon, PlusIcon } from "@heroicons/react/24/solid";
import { compact, isEmpty } from "lodash-es";
import { Select } from "~/components/select";

export async function loader({ request, params }: LoaderFunctionArgs) {
	const url = new URL(request.url);
	const query = url.searchParams.get("query") ?? "";
	const filter = url.searchParams.get("filter") ?? "all";

	const where = compact([
		{ clinicId: params.id },
		isEmpty(query)
			? null
			: {
					name: { contains: query, mode: "insensitive" },
			  },
		filter === "valid"
			? {
					AND: [
						{ OR: [{ validUntil: null }, { validUntil: { gte: new Date() } }] },
						{ OR: [{ validFrom: null }, { validFrom: { lte: new Date() } }] },
					],
			  }
			: null,
	]);

	const [queryParams, pagination] = await getPaginationState(
		request,
		db.agenda.count({ where: { AND: where } }),
		20,
	);
	const agendas = await db.agenda.findMany({
		...queryParams,
		include: {
			doctor: true,
			services: true,
			plans: {
				take: 1,
			},
			users: {
				select: {
					id: true,
					firstName: true,
					lastName: true,
				},
			},
		},
		orderBy: [{ name: "asc" }],
		where: {
			AND: where,
		},
	});
	console.lo;
	const services = await db.serviceOffering.findMany({
		where: {
			clinicId: params.id,
		},
		include: {
			service: true,
		},
	});
	const doctors = await db.doctor.findMany({
		...queryParams,
		where: {
			worksAt: {
				some: {
					id: params.id,
				},
			},
		},
	});
	const users = await db.user.findMany({
		where: {
			clinicId: params.id,
		},
		select: {
			id: true,
			firstName: true,
			lastName: true,
			email: true,
		},
	});

	return { agendas, services, pagination, doctors, users };
}

export default function ClinicDashboard() {
	const { id } = useParams();
	const [search] = useSearchParams();
	const navigate = useNavigate();
	const filterOptions = [
		{ label: "Mostra tutte", value: "all" },
		{ label: "Mostra agende valide", value: "valid" },
	];
	const filterValue = filterOptions.find(
		(d) => d.value === (search.get("filter") ?? "all"),
	);
	return (
		<div>
			<div className="search-bar-container -mx-2">
				<Form className="search-bar bg-transparent gap-x-2">
					<select
						name="filter"
						defaultValue={filterValue?.value}
						onChange={(e) => {
							search.set("filter", e.target.value);
							navigate({ search: search.toString() });
						}}
					>
						{filterOptions.map((option) => (
							<option key={option.value} value={option.value}>
								{option.label}
							</option>
						))}
					</select>
					<input
						type="text"
						name="query"
						defaultValue={search.get("query") ?? ""}
						placeholder="Cerca per nome agenda..."
					/>
				</Form>
			</div>
			<AgendasTable clinic={id!} />
		</div>
	);
}
