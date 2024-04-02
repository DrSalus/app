import {
	MagnifyingGlassIcon,
	PencilIcon,
	PlusIcon,
	TrashIcon,
} from "@heroicons/react/24/solid";
import { type Patient } from "@prisma/client";
import {
	Form,
	useLoaderData,
	useNavigate,
	useSearchParams,
} from "@remix-run/react";
import classNames from "classnames";
import { uniq } from "lodash-es";
import { DateTime } from "luxon";
import React, { useEffect, useState } from "react";
import Button from "~/components/button";
import DeleteModal from "~/components/deleteModal";
import Pagination from "~/components/pagination";
import Show from "~/components/show";
import { PatientDialog } from "~/dialogs/patientDialog";
import { loader } from "~/routes/patients";
import type { WithSerializedTypes } from "~/utils/client";
import { useDialog } from "~/utils/dialog";

export default function PatientsTable(p: {
	className?: string;
	canAddPatient?: boolean;
}) {
	const { patients } = useLoaderData<typeof loader>();
	const [isModalOpen, patient, openModal, onCloseModal] =
		useDialog<WithSerializedTypes<Patient>>();
	const [isRemoveOpen, patientToRemove, removePatient, onCloseRemove] =
		useDialog<string>();
	const [search] = useSearchParams();

	const [selectedIds, setSelectedIds] = useState([]);
	const navigate = useNavigate();

	useEffect(() => {
		setSelectedIds([]);
	}, [patient]);

	return (
		<div className={classNames("flex flex-col pt-4", p.className)}>
			<div className="search-bar-container">
				<Form className="search-bar">
					<input
						type="text"
						name="query"
						defaultValue={search.get("query") ?? ""}
						placeholder="Cerca Paziente..."
					/>
					<button type="submit">
						<MagnifyingGlassIcon className="h-6 px-2 text-sky-800" />
					</button>
				</Form>
				<Show if={p.canAddPatient === true}>
					<Button
						onClick={() => openModal()}
						intent="primary"
						text="Aggiungi Paziente"
						icon={<PlusIcon />}
					/>
				</Show>
			</div>
			<div className="table mx-6">
				<table>
					<thead>
						<tr>
							{/* <th className="w-8"></th> */}
							<th className="">Paziente</th>
							<th className="">Cod. Fiscale</th>
							<th className="">Data di Nascita</th>
							<th className="">Città di Nascita</th>
							<th className="w-2">Azioni</th>
						</tr>
					</thead>
					<tbody>
						{patients.map((u) => {
							const isSelected = selectedIds.includes(u.id);
							const toggleCheck = () => {
								if (isSelected) {
									setSelectedIds((prev) => prev.filter((id) => id !== u.id));
								} else {
									setSelectedIds((prev) => uniq([...prev, u.id]));
								}
							};
							return (
								<tr
									key={u.id}
									className="cursor-pointer hover:bg-gray-50"
									onClick={() => navigate(`/patient/${u.id}/bookings`)}
								>
									{/* <td onClick={() => toggleCheck()}>
										<input
											type="checkbox"
											checked={isSelected}
											onChange={() => toggleCheck()}
										/>
									</td> */}
									<td className="font-medium">
										<div className="flex text-bas font-medium items-center gap-x-1">
											<div>{u.firstName}</div>
											<div>{u.lastName}</div>
											<div className="flex-grow" />
											<PatientAge patient={u} />
										</div>
									</td>
									<td className="text-gray-800">{u.fiscalCode}</td>
									<td className="text-gray-800">
										<div className="flex items-center gap-x-2">
											{u.birthDate != null
												? DateTime.fromISO(u.birthDate).toLocaleString(
														DateTime.DATE_MED,
												  )
												: ""}
										</div>
									</td>
									<td className="text-gray-800">{u.birthCity}</td>
									<td
										className="flex gap-x-2"
										onClick={(e) => e.stopPropagation()}
									>
										<Button
											onClick={() => openModal(u)}
											small
											text="Modifica"
											icon={<PencilIcon />}
										/>
										<Button
											onClick={() => removePatient(u.id)}
											small
											intent="danger"
											text="Rimuovi"
											icon={<TrashIcon />}
										/>
									</td>
								</tr>
							);
						})}
					</tbody>
				</table>
			</div>
			<Pagination />
			<PatientDialog
				isOpen={isModalOpen}
				patient={patient}
				redirectTo={`/patients`}
				onClose={onCloseModal}
			/>
			<DeleteModal
				message="Rimuovendo il paziente verranno cancellati tutti i dati e le prenotazioni associate. Sei sicuro di voler procedere?"
				id={patientToRemove ?? ""}
				isOpen={isRemoveOpen}
				action="/patients/upsert"
				redirectTo={`/patients`}
				onClose={onCloseRemove}
			/>
		</div>
	);
}

export function PatientAge(p: { patient: WithSerializedTypes<Patient> }) {
	if (p.patient.birthDate == null) {
		return <React.Fragment />;
	}
	const age = Math.floor(
		Math.abs(DateTime.fromISO(p.patient.birthDate).diffNow("years").years),
	);

	return (
		<div
			className={classNames(
				"flex rounded-lg px-2 text-sm font-semibold py-0.5",
				{
					"bg-blue-200 text-blue-600": p.patient.gender === "MALE",
					"bg-pink-200 text-pink-600": p.patient.gender === "FEMALE",
					"bg-gray-200 text-gray-800": p.patient.gender === "NOT_SPECIFIED",
				},
			)}
		>
			{age} Anni
		</div>
	);
}
