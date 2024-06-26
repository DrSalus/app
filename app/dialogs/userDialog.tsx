import { PlusIcon, XMarkIcon } from "@heroicons/react/24/solid";
import { User, Clinic } from "@prisma/client";
import { UserKind } from "~/utils/enum";
import type { WithSerializedTypes } from "~/utils/client";
import Button from "~/components/button";
import Overlay, { DialogCloseOnSubmit } from "~/components/overlay";
import { ValidatedForm, useControlField } from "remix-validated-form";
import { validator } from "~/validators/user";
import InputField from "~/components/fields/inputField";
import SelectField from "~/components/fields/selectField";
import { v4 } from "uuid";
import Show from "~/components/show";
import { useMemo } from "react";
import ClinicField from "~/components/fields/clinicField";
import { isEmpty } from "lodash-es";

export function UserDialog(p: {
	redirectTo?: string;
	isOpen: boolean;
	isAdmin?: boolean;
	user?: WithSerializedTypes<User | null>;
	clinics?: WithSerializedTypes<Pick<Clinic, "id" | "name">>[];
	onClose?: () => void;
}) {
	const isNew = p.user == null;
	const { isOpen, user } = p;
	// biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
	const key = useMemo(() => {
		return user?.id ?? v4();
	}, [isOpen, user]);
	return (
		<Overlay isOpen={p.isOpen}>
			<div className="card w-3/5 z-10">
				<h2>{isNew ? "Aggiungi Utente" : "Modifica Utente"}</h2>
				<XMarkIcon className="close-button" onClick={p.onClose} />

				<ValidatedForm
					method="post"
					key={key}
					validator={validator}
					resetAfterSubmit={true}
					defaultValues={p.user ?? {}}
					encType="multipart/form-data"
					action="/users/upsert"
				>
					<DialogCloseOnSubmit onClose={p.onClose} />
					<div className="form-grid px-4 pt-4">
						<input
							type="hidden"
							value={isNew ? "create" : "update"}
							name="_action"
						/>
						<input type="hidden" name="_redirect" value={p.redirectTo} />
						<input type="hidden" name="_id" value={p.user?.id} />

						<InputField name="firstName" label="Nome" />
						<InputField name="lastName" label="Cognome" />
						<SelectField
							name="kind"
							label="Tipo Account"
							options={
								p.isAdmin
									? [
											{ value: UserKind.PATIENT, label: "Paziente" },
											{ value: UserKind.DOCTOR, label: "Dottore" },
											{
												value: UserKind.DOCTOR_ASSISTANT,
												label: "Accettazione",
											},
											{ value: UserKind.ADMIN, label: "Amministratore" },
											{
												value: UserKind.CLINIC_MANAGER,
												label: "Gestore Struttura",
											},
									  ]
									: [
											{ value: UserKind.DOCTOR, label: "Dottore" },
											{
												value: UserKind.DOCTOR_ASSISTANT,
												label: "Accettazione",
											},
											{
												value: UserKind.CLINIC_MANAGER,
												label: "Gestore Struttura",
											},
									  ]
							}
						/>

						{p.isAdmin ? (
							<ClinicField clinics={p.clinics ?? []} />
						) : (
							<input type="hidden" name="clinicId" value={p.clinics?.[0]?.id} />
						)}

						<InputField name="email" label="Indirizzo Email" />
						<Show if={isNew}>
							<>
								<InputField
									name="password"
									inputProps={{ type: "password" }}
									label="Password"
								/>
								<PasswordConfirmationInput />
							</>
						</Show>
					</div>

					<div className="p-4 pb-2">
						<Button
							intent="primary"
							className="w-full"
							type="submit"
							text={isNew ? "Aggiungi Utente" : "Modifica Utente"}
							icon={<PlusIcon />}
						/>
					</div>
				</ValidatedForm>
			</div>
		</Overlay>
	);
}

function PasswordConfirmationInput() {
	const [value] = useControlField<string>("password");
	const [confirmation] = useControlField<string>("passwordConfirmation");

	const hasError = useMemo(() => {
		return value !== confirmation && !isEmpty(confirmation);
	}, [value, confirmation]);

	return (
		<>
			<InputField
				inputProps={{ type: "password" }}
				name="passwordConfirmation"
				label="Conferma Password"
				errorText={hasError ? "Le password non corrispondono" : undefined}
			/>
		</>
	);
}
