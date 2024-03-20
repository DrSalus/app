import {
	MagnifyingGlassIcon,
	PencilIcon,
	PlusIcon,
	TrashIcon,
} from "@heroicons/react/24/solid";
import { UserKind, type Clinic, type ClinicalService } from "@prisma/client";
import type { LoaderFunctionArgs } from "@remix-run/node";
import { Form, useLoaderData, useSearchParams } from "@remix-run/react";
import React from "react";
import Button from "~/components/button";
import DeleteModal from "~/components/deleteModal";
import Header from "~/components/header";
import Pagination, { getPaginationState } from "~/components/pagination";
import ServiceTypeLabel, {
	ServiceTypeTag,
} from "~/components/serviceTypeLabel";
import { ClinicDialog } from "~/dialogs/clinicDialog";
import { ClinicalServiceDialog } from "~/dialogs/clinicalServiceDialog";
import { authenticator } from "~/services/auth.server";
import type { WithSerializedTypes } from "~/utils/client";
import { db } from "~/utils/db.server";
import { useDialog } from "~/utils/dialog";

export async function loader({ request }: LoaderFunctionArgs) {
	const url = new URL(request.url);
	const query = url.searchParams.get("query") ?? "";

	const user = await authenticator.isAuthenticated(request, {
		failureRedirect: "/login",
	});

	const where = {
		OR: [
			{ name: { contains: query, mode: "insensitive" } },
			{ nomenCode: { contains: query, mode: "insensitive" } },
			{ leaCode: { contains: query, mode: "insensitive" } },
		],
	};

	const [queryParams, pagination] = await getPaginationState(
		request,
		db.clinicalService.count({ where }),
		22,
	);

	const clinicalServices = await db.clinicalService.findMany({
		...queryParams,
		orderBy: [{ name: "asc" }],
		where,
	});

	return { user, pagination, clinicalServices };
}

export default function ClinicalServicePage() {
	const { clinicalServices, user } = useLoaderData<typeof loader>();
	const [isModalOpen, clinicalService, openModal, onCloseModal] =
		useDialog<WithSerializedTypes<ClinicalService>>();
	const [
		isRemoveOpen,
		clinicalServiceToRemove,
		removeClinicalService,
		onCloseRemove,
	] = useDialog<string>();
	const isAdmin = user.kind === UserKind.ADMIN;
	const [search] = useSearchParams();

	return (
		<div className="page">
			<div className="headed-card">
				<Header title="Gestione Prestazioni" />
			</div>
			<div className="search-bar-container -mx-2">
				<Form className="search-bar">
					<input
						type="text"
						name="query"
						defaultValue={search.get("query") ?? ""}
						placeholder="Cerca per nome prestazione o codice..."
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
			<div className="table mx-6">
				<table>
					<thead>
						<tr>
							<th className="w-16">Branca</th>
							<th className="w-24">Nomenclatura</th>
							<th className="w-28">Cod. LEA</th>
							<th className="w-56">Tipologia</th>
							<th className="">Nome</th>
							{isAdmin ? <th className="w-2">Azioni</th> : <React.Fragment />}
						</tr>
					</thead>
					<tbody>
						{clinicalServices.map((u) => (
							<tr key={u.id}>
								<td>{u.branchCode}</td>
								<td className="text-gray-600">{u.nomenCode}</td>
								<td className="text-gray-600">{u.leaCode}</td>
								<td className="">
									<div className="flex">
										<ServiceTypeTag type={u.type} />
									</div>
								</td>
								<td className="font-medium">{u.name}</td>
								{isAdmin ? (
									<td className="flex gap-x-2">
										<Button
											onClick={() => openModal(u)}
											small
											text="Modifica"
											icon={<PencilIcon />}
										/>
										<Button
											onClick={() => removeClinicalService(u.id)}
											small
											intent="danger"
											text="Rimuovi"
											icon={<TrashIcon />}
										/>
									</td>
								) : (
									<React.Fragment />
								)}
							</tr>
						))}
					</tbody>
				</table>
			</div>
			<Pagination
				primaryButton={
					isAdmin ? (
						<Button
							onClick={() => openModal()}
							intent="primary"
							small
							text="Aggiungi"
							icon={<PlusIcon />}
						/>
					) : undefined
				}
			/>
			<ClinicalServiceDialog
				isOpen={isModalOpen}
				clinicalService={clinicalService}
				redirectTo={"/clinicalServices"}
				onClose={onCloseModal}
			/>
			<DeleteModal
				id={clinicalServiceToRemove ?? ""}
				isOpen={isRemoveOpen}
				action="/clinicalService/upsert"
				redirectTo={"/clinicalServices"}
				onClose={onCloseRemove}
			/>
		</div>
	);
}
