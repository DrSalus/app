import {
	MagnifyingGlassIcon,
	PencilIcon,
	PlusIcon,
} from "@heroicons/react/24/solid";
import { Clinic, User, UserKind } from "@prisma/client";
import { LoaderFunctionArgs, redirect } from "@remix-run/node";
import { Form, useLoaderData, useSearchParams } from "@remix-run/react";
import Button from "~/components/button";
import Header from "~/components/header";
import Pagination, { getPaginationState } from "~/components/pagination";
import { UserKindTag } from "~/components/userKindTag";
import { UserDialog } from "~/dialogs/userDialog";
import { authenticator } from "~/services/auth.server";
import { WithSerializedTypes } from "~/utils/client";
import { db } from "~/utils/db.server";
import { useDialog } from "~/utils/dialog";
import { getDisplayName } from "~/utils/patient";

export async function loader({ request, params }: LoaderFunctionArgs) {
	const user = await authenticator.isAuthenticated(request, {
		failureRedirect: "/login",
	});

	const url = new URL(request.url);
	const query = url.searchParams.get("query") ?? "";

	// Redirect if not admin or clinic manager.
	if (user.kind !== UserKind.ADMIN && user.kind !== UserKind.CLINIC_MANAGER) {
		return redirect("/");
	}

	const [queryParams, pagination] = await getPaginationState(
		request,
		db.user.count(),
		13,
	);

	const users = await db.user.findMany({
		...queryParams,
		where: {
			AND: [
				{
					clinicId: user.kind !== UserKind.ADMIN ? user.clinicId : undefined,
				},
				{
					OR: [
						{ email: { contains: query, mode: "insensitive" } },
						{ lastName: { contains: query, mode: "insensitive" } },
						{ firstName: { contains: query, mode: "insensitive" } },
					],
				},
			],
		},
		orderBy: [{ firstName: "asc" }, { lastName: "asc" }],
		include: {
			clinic: {
				select: {
					name: true,
				},
			},
		},
	});

	let clinics: WithSerializedTypes<Pick<Clinic, "id" | "name">[]> = [];
	if (user.kind === UserKind.ADMIN) {
		clinics = await db.clinic.findMany({
			take: 1000,
			select: {
				id: true,
				name: true,
			},
		});
	} else if (user.clinicId != null) {
		const clinic = await db.clinic.findUnique({
			where: { id: user.clinicId },
			select: {
				id: true,
				name: true,
			},
		});
		if (clinic != null) {
			clinics = [clinic];
		}
	}

	return { users, user, clinics, pagination };
}

export default function Users() {
	const { users, pagination, clinics, ...other } =
		useLoaderData<typeof loader>();
	const isAdmin = other.user.kind === UserKind.ADMIN;
	const [isModalOpen, user, openModal, onCloseModal] =
		useDialog<WithSerializedTypes<User>>();
	const [search] = useSearchParams();

	return (
		<div className="page">
			<div className="search-bar-container">
				<Form className="search-bar">
					<input
						type="text"
						name="query"
						defaultValue={search.get("query") ?? ""}
						placeholder="Cerca Utenti..."
					/>
					<button type="submit">
						<MagnifyingGlassIcon className="h-6 px-2 text-sky-800" />
					</button>
				</Form>
			</div>
			<div className="flex flex-col">
				<div className="table mx-6">
					<table>
						<thead>
							<tr>
								<th className="w-48">Tipo</th>
								<th className="w-52">Nome</th>
								<th className="w-52">Email</th>
								<th>Clinica</th>
								<th>Azioni</th>
							</tr>
						</thead>
						<tbody>
							{users?.map((u) => (
								<tr key={u.id} className="cursor-pointer hover:bg-gray-100">
									<td className="">
										<div className="flex">
											<UserKindTag kind={u.kind} />
										</div>
									</td>
									<td className="">{getDisplayName(u)} </td>
									<td className="">{u.email} </td>
									<td className="">{u.clinic?.name}</td>
									<td>
										<Button
											onClick={() => openModal(u)}
											small
											text="Modifica"
											icon={<PencilIcon />}
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
				<UserDialog
					isOpen={isModalOpen}
					isAdmin={isAdmin}
					clinics={clinics}
					user={user}
					onClose={onCloseModal}
				/>
			</div>
		</div>
	);
}
