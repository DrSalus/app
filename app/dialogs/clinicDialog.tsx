import { PlusIcon, XMarkIcon } from "@heroicons/react/24/solid";
import type { Clinic } from "@prisma/client";
import type { WithSerializedTypes } from "~/utils/client";
import Button from "~/components/button";
import Overlay, { DialogCloseOnSubmit } from "~/components/overlay";
import { ValidatedForm } from "remix-validated-form";
import { validator } from "~/validators/clinic";
import InputField from "~/components/fields/inputField";
import { v4 } from "uuid";
import PhoneInputField from "~/components/fields/phoneInputField";

export function ClinicDialog(p: {
	clinic?: WithSerializedTypes<Clinic | null>;
	redirectTo?: string;
	isOpen: boolean;
	onClose?: () => void;
}) {
	const isNew = p.clinic == null;

	return (
		<Overlay isOpen={p.isOpen}>
			<div className="card w-3/5 z-10">
				<h2>{isNew ? "Aggiungi Struttura" : "Modifica Struttura"}</h2>
				<XMarkIcon className="close-button" onClick={p.onClose} />

				<ValidatedForm
					method="post"
					key={p.clinic?.id ?? v4()}
					validator={validator}
					resetAfterSubmit={true}
					defaultValues={p.clinic ?? {}}
					encType="multipart/form-data"
					action="/clinics/upsert"
				>
					<DialogCloseOnSubmit onClose={p.onClose} />
					<div className="form-grid px-4 pt-4">
						<input
							type="hidden"
							value={isNew ? "create" : "update"}
							name="_action"
						/>
						<input type="hidden" name="_redirect" value={p.redirectTo} />
						<input type="hidden" name="_id" value={p.clinic?.id} />

						<InputField
							name="name"
							label="Nome"
							helperText="Il nome della struttura."
						/>
						<InputField name="address" label="Indirizzo" />
						<InputField name="city" label="Città" />
						<InputField
							name="province"
							label="Provincia"
							inputProps={{ maxLength: 2 }}
						/>
						<InputField
							name="postalCode"
							label="CAP"
							inputProps={{ maxLength: 5 }}
						/>
						<PhoneInputField name="phoneNumber" label="Numero di Telefono" />
					</div>

					<div className="p-4 pb-2">
						<Button
							intent="primary"
							className="w-full"
							type="submit"
							text={isNew ? "Aggiungi Struttura" : "Modifica Struttura"}
							icon={<PlusIcon />}
						/>
					</div>
				</ValidatedForm>
			</div>
		</Overlay>
	);
}
