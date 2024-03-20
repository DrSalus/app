import {
	MagnifyingGlassIcon,
	PencilIcon,
	PlusIcon,
	TrashIcon,
} from "@heroicons/react/24/solid";
import { ServiceOffering } from "@prisma/client";
import {
	Form,
	useLoaderData,
	useParams,
	useSearchParams,
} from "@remix-run/react";
import Button from "~/components/button";
import Pagination, { getPaginationState } from "~/components/pagination";
import ServiceTypeLabel, {
	ServiceTypeTag,
} from "~/components/serviceTypeLabel";
import { OfferingDialog } from "~/dialogs/offeringDialog";
import { authenticator } from "~/services/auth.server";
import { WithSerializedTypes } from "~/utils/client";
import { db } from "~/utils/db.server";
import { useDialog } from "~/utils/dialog";

export async function loader({ request, params }: LoaderFunctionArgs) {
	const url = new URL(request.url);
	const query = url.searchParams.get("query") ?? "";

	const user = await authenticator.isAuthenticated(request, {
		failureRedirect: "/login",
	});

	const where = {
		clinicId: params.id,
		OR: [
			{ doctor: { firstName: { contains: query, mode: "insensitive" } } },
			{ doctor: { lastName: { contains: query, mode: "insensitive" } } },
			{ service: { name: { contains: query, mode: "insensitive" } } },
		],
	};
	const [queryParams, pagination] = await getPaginationState(
		request,
		db.serviceOffering.count({ where: { AND: where } }),
		20,
	);

	const offering = await db.serviceOffering.findMany({
		...queryParams,
		include: {
			doctor: true,
			service: true,
		},
		orderBy: [{ service: { name: "asc" } }],
		where: {
			AND: [where],
		},
	});
	const services = await db.clinicalService.findMany({});

	const doctors = await db.doctor.findMany({
		where: {
			worksAt: {
				some: { id: params.id },
			},
		},
	});

	return { user, pagination, doctors, services, offering };
}

export default function ClinicDashboard() {
	const { id } = useParams();
	const { offering, services, doctors } = useLoaderData<typeof loader>();
	const [isModalOpen, serviceOffering, openModal, onCloseModal] =
		useDialog<WithSerializedTypes<ServiceOffering>>();
	const [search] = useSearchParams();

	const amountFormatter = new Intl.NumberFormat("it-IT", {
		style: "currency",
		currency: "EUR",
	});

	return (
		<div className="flex flex-col">
			<Form className="search-bar mx-4 mb-4">
				<input
					type="text"
					name="query"
					defaultValue={search.get("query") ?? ""}
					placeholder="Cerca per nome, prestazione o specializzazione..."
				/>
				<button type="submit">
					<MagnifyingGlassIcon className="h-6 px-2 text-sky-800" />
				</button>
			</Form>
			<div className="table mx-4">
				<table>
					<thead>
						<tr>
							<th className="">Dottore</th>
							<th className="">Tipo</th>
							<th className="">Prestazione</th>
							<th className="">Costo</th>
							<th className="">Durata</th>
							<th className=""></th>
						</tr>
					</thead>
					<tbody>
						{offering.map((u) => (
							<tr key={u.id}>
								<td className="">
									{u.doctor.firstName} {u.doctor.lastName}
								</td>
								<td>
									<div className="flex">
										<ServiceTypeTag type={u.service.type} />
									</div>
								</td>
								<td className="">{u.service.name}</td>
								<td className="">{amountFormatter.format(u.amount)}</td>
								<td className="">{u.duration} min</td>
								<td className="flex gap-x-2">
									<Button
										onClick={() => openModal(u)}
										small
										text="Modifica"
										icon={<PencilIcon />}
									/>
									{/* <Button
                    onClick={() => removeDoctor(u.id)}
                    small
                    intent="danger"
                    text="Rimuovi"
                    icon={<TrashIcon />}
                  /> */}
								</td>
							</tr>
						))}
					</tbody>
				</table>
			</div>
			<Pagination
				primaryButton={
					<Button
						onClick={() => openModal()}
						intent="primary"
						small
						text="Aggiungi"
						icon={<PlusIcon />}
					/>
				}
			/>
			<OfferingDialog
				doctors={doctors}
				services={services}
				clinicId={id ?? ""}
				onClose={onCloseModal}
				serviceOffering={serviceOffering}
				isOpen={isModalOpen}
			/>
		</div>
	);
}
