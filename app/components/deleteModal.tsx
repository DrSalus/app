import { TrashIcon, XMarkIcon } from "@heroicons/react/24/solid";
import { Form } from "@remix-run/react";
import Button from "~/components/button";
import Overlay from "~/components/overlay";

export default function DeleteModal(p: {
	id: string;
	redirectTo?: string;
	title?: string;
	message?: string;
	isOpen: boolean;
	action: string;
	onClose?: () => void;
}) {
	return (
		<Overlay isOpen={p.isOpen}>
			<div className="card w-1/3">
				<h2>{p.title ?? "Conferma Rimozione"}</h2>
				<XMarkIcon className="close-button" onClick={p.onClose} />
				<Form
					method="post"
					encType="multipart/form-data"
					action={p.action}
					className="flex flex-col gap-4 items-center"
					onSubmit={p.onClose}
				>
					<div className="p-8 w-full flex flex-col items-center">
						<TrashIcon className="w-16 h-16 text-gray-400" />
						<p className="text-center text-lg p-6">
							{p.message ??
								"Sei davvero sicuro di voler rimuovere questo elemento?"}
						</p>
					</div>
					<input type="hidden" name="_action" value="delete" />
					<input type="hidden" name="_id" value={p.id} />
					<input type="hidden" name="_redirect" value={p.redirectTo} />
					<div className="w-full flex justify-evenly">
						<Button
							type="submit"
							intent={"none"}
							className="w-1/3"
							text={"Annulla"}
							onClick={p.onClose}
						/>
						<Button
							type="submit"
							intent={"danger"}
							className="w-1/3"
							text={"Elimina"}
							icon={<TrashIcon />}
						/>
					</div>
				</Form>
			</div>
		</Overlay>
	);
}
