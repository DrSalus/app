import { PlusIcon } from "@heroicons/react/24/solid";
import { User } from "@prisma/client";
import { LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
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

	const [queryParams, pagination] = await getPaginationState(
		request,
		db.user.count(),
		13,
	);

	const users = await db.user.findMany({
		...queryParams,
	});

	return { users, pagination };
}

export default function Users() {
	const { users, pagination } = useLoaderData<typeof loader>();
	const [isModalOpen, user, openModal, onCloseModal] =
		useDialog<WithSerializedTypes<User>>();

	return (
		<div className="page">
			<div className="headed-card">
				<Header title="Gestione Utenti" />
			</div>
			<div className="flex flex-col">
				<div className="table mx-4">
					<table>
						<thead>
							<tr>
								<th className="w-40">Tipo</th>
								<th className="w-52">Nome</th>
								<th className="w-52">Email</th>
								<th>_</th>
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
									<td>_</td>
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
				<UserDialog isOpen={isModalOpen} onClose={onCloseModal} />
				{/* <AgendaDialog
				isOpen={isModalOpen}
				doctors={doctors}
				services={services}
				onClose={onCloseModal}
				clinicId={p.clinic}
				agenda={agenda}
			/>

			<DeleteModal
				id={agendaToRemove ?? ""}
				isOpen={isRemoveOpen}
				action="/agendas/upsert"
				onClose={onCloseRemove}
			/> */}
			</div>
		</div>
	);
}
