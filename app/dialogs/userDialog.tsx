import { PlusIcon, XMarkIcon } from "@heroicons/react/24/solid";
import { Gender, type Patient } from "@prisma/client";
import type { WithSerializedTypes } from "~/utils/client";
import Button from "~/components/button";
import Overlay, { DialogCloseOnSubmit } from "~/components/overlay";
import {
	ValidatedForm,
	useControlField,
	useUpdateControlledField,
} from "remix-validated-form";
import { validator } from "~/validators/user";
import InputField from "~/components/fields/inputField";
import SelectField from "~/components/fields/selectField";
import { v4 } from "uuid";

export function UserDialog(p: {
	redirectTo?: string;
	isOpen: boolean;
	onClose?: () => void;
}) {
	return (
		<Overlay isOpen={p.isOpen}>
			<div className="card w-3/5 z-10">
				<h2>{"Aggiungi Utente"}</h2>
				<XMarkIcon className="close-button" onClick={p.onClose} />

				<ValidatedForm
					method="post"
					key={v4()}
					validator={validator}
					resetAfterSubmit={true}
					// defaultValues={defaultValues}
					encType="multipart/form-data"
					action="/users/upsert"
				>
					<DialogCloseOnSubmit onClose={p.onClose} />
					<div className="form-grid px-4 pt-4">
						<input type="hidden" value="create" name="_action" />
						<input type="hidden" name="_redirect" value={p.redirectTo} />

						<InputField name="firstName" label="Nome" />
						<InputField name="lastName" label="Cognome" />
						<InputField name="email" label="Indirizzo Email" />
						<InputField name="password" label="Password" />
						<InputField name="passwordConfirmation" label="Conferma Password" />
					</div>

					<div className="p-4 pb-2">
						<Button
							intent="primary"
							className="w-full"
							type="submit"
							text={"Aggiungi Utente"}
							icon={<PlusIcon />}
						/>
					</div>
				</ValidatedForm>
			</div>
		</Overlay>
	);
}
