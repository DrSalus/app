import {
	MagnifyingGlassIcon,
	PencilIcon,
	PlusIcon,
	TrashIcon,
} from "@heroicons/react/24/solid";
import { UserKind, type Clinic } from "@prisma/client";
import type { LinksFunction, LoaderFunctionArgs } from "@remix-run/node";
import {
	Form,
	redirect,
	useLoaderData,
	useNavigate,
	useSearchParams,
} from "@remix-run/react";
import Button from "~/components/button";
import DeleteModal from "~/components/deleteModal";
import Header from "~/components/header";
import Pagination, { getPaginationState } from "~/components/pagination";
import { ClinicDialog } from "~/dialogs/clinicDialog";
import { authenticator } from "~/services/auth.server";
import type { WithSerializedTypes } from "~/utils/client";
import { db } from "~/utils/db.server";
import { useDialog } from "~/utils/dialog";
import useStopPropagation from "~/utils/events";

export const links: LinksFunction = () => [
	{
		rel: "stylesheet",
		href: "https://unpkg.com/leaflet@1.8.0/dist/leaflet.css",
	},
];
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
		db.clinic.count(),
		20,
	);
	const clinics = await db.clinic.findMany({
		...queryParams,
		orderBy: [{ name: "asc" }],
		where: {
			OR: [
				{
					name: {
						contains: query,
						mode: "insensitive",
					},
				},
				{
					city: {
						contains: query,
						mode: "insensitive",
					},
				},
				{
					address: {
						contains: query,
						mode: "insensitive",
					},
				},
			],
		},
	});

	return { user, pagination, clinics };
}

export default function Clinics() {
	const { clinics } = useLoaderData<typeof loader>();
	const navigate = useNavigate();
	const [isModalOpen, clinic, openModal, onCloseModal] =
		useDialog<WithSerializedTypes<Clinic>>();
	const [isRemoveOpen, clinicToRemove, removeClinic, onCloseRemove] =
		useDialog<string>();
	const [search] = useSearchParams();

	const stopPropagation = useStopPropagation();

	return (
		<div className="page">
			<div className="headed-card">
				<Header title="Gestione Strutture" />
			</div>
			<div className="search-bar-container -mx-2">
				<Form className="search-bar">
					<input
						type="text"
						name="query"
						defaultValue={search.get("query") ?? ""}
						placeholder="Cerca per nome struttura, indirizzo o città..."
					/>
					<button type="submit">
						<MagnifyingGlassIcon className="h-6 px-2 text-sky-800" />
					</button>
				</Form>
				<Button
					onClick={() => openModal()}
					intent="primary"
					text="Aggiungi Struttura"
					icon={<PlusIcon />}
				/>
			</div>
			<div className="table mx-4">
				<table>
					<thead>
						<tr>
							<th className="">Nome</th>
							<th className="">Indirizzo</th>
							<th className="w-2">Azioni</th>
						</tr>
					</thead>
					<tbody>
						{clinics.map((u) => (
							<tr
								key={u.id}
								className="hover:bg-gray-100 cursor-pointer"
								onClick={() => navigate(`/clinic/${u.id}/home`)}
							>
								<td className="font-medium">{u.name}</td>
								<td className="text-gray-800">
									{u.address}, {u.city}
								</td>
								<td className="flex gap-x-2" {...stopPropagation}>
									<Button
										onClick={() => openModal(u)}
										small
										text="Modifica"
										icon={<PencilIcon />}
									/>
									<Button
										onClick={() => removeClinic(u.id)}
										small
										intent="danger"
										text="Rimuovi"
										icon={<TrashIcon />}
									/>
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
			<ClinicDialog
				isOpen={isModalOpen}
				clinic={clinic}
				redirectTo={`/clinics`}
				onClose={onCloseModal}
			/>
			<DeleteModal
				id={clinicToRemove ?? ""}
				isOpen={isRemoveOpen}
				action="/clinics/upsert"
				redirectTo={`/clinics`}
				onClose={onCloseRemove}
			/>
		</div>
	);
}
