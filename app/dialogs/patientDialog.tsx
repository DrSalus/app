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
import { validator } from "~/validators/patient";
import InputField from "~/components/fields/inputField";
import SelectField from "~/components/fields/selectField";
import React, { useEffect } from "react";
import CodiceFiscale from "codice-fiscale-js";
import { DateTime } from "luxon";
import { upperFirst } from "lodash-es";
import { v4 } from "uuid";

export function PatientDialog(p: {
	patient?: WithSerializedTypes<Patient | null>;
	redirectTo?: string;
	isOpen: boolean;
	onClose?: () => void;
}) {
	const isNew = p.patient == null;

	// Make sure we have the birth date only date.
	let defaultValues: Partial<WithSerializedTypes<Patient>> = p.patient ?? {};
	if (defaultValues.birthDate != null) {
		defaultValues = {
			...defaultValues,
			birthDate: defaultValues.birthDate.split("T")[0],
		};
	}

	return (
		<Overlay isOpen={p.isOpen}>
			<div className="card w-3/5 z-10">
				<h2>{isNew ? "Aggiungi Paziente" : "Modifica Paziente"}</h2>
				<XMarkIcon className="close-button" onClick={p.onClose} />

				<ValidatedForm
					method="post"
					key={p.patient?.id ?? v4()}
					validator={validator}
					resetAfterSubmit={true}
					defaultValues={defaultValues}
					encType="multipart/form-data"
					action="/patients/upsert"
				>
					<DialogCloseOnSubmit onClose={p.onClose} />
					<div className="form-grid px-4 pt-4">
						<input
							type="hidden"
							value={isNew ? "create" : "update"}
							name="_action"
						/>
						<input type="hidden" name="_redirect" value={p.redirectTo} />
						<input type="hidden" name="_id" value={p.patient?.id} />

						<FiscalCodeUpdater />
						<InputField name="firstName" label="Nome" />
						<InputField name="lastName" label="Cognome" />
						<InputField name="fiscalCode" label="Codice Fiscale" />
						<InputField
							inputProps={{ type: "date" }}
							name="birthDate"
							label="Data di Nascita"
						/>
						<InputField name="birthCity" label="Città di Nascita" />
						<SelectField
							name="gender"
							label="Genere"
							options={[
								{ value: "", label: "-" },
								{ value: Gender.MALE, label: "Maschio" },
								{ value: Gender.FEMALE, label: "Femmina" },
								{ value: Gender.NOT_SPECIFIED, label: "Non specificato" },
							]}
						/>
					</div>

					<div className="p-4 pb-2">
						<Button
							intent="primary"
							className="w-full"
							type="submit"
							text={isNew ? "Aggiungi Paziente" : "Modifica Paziente"}
							icon={<PlusIcon />}
						/>
					</div>
				</ValidatedForm>
			</div>
		</Overlay>
	);
}

function FiscalCodeUpdater() {
	const [value] = useControlField<string>("fiscalCode");
	const setValue = useUpdateControlledField();

	useEffect(() => {
		try {
			console.log("V", value);
			const cf = new CodiceFiscale(value);
			console.log(cf);
			if (cf.isValid()) {
				setValue(
					"birthDate",
					DateTime.fromJSDate(cf.birthday).toFormat("yyyy-MM-dd"),
				);
				setValue("gender", cf.gender === "M" ? Gender.MALE : Gender.FEMALE);
				setValue("birthCity", upperFirst(cf.birthplace.nome));
			}
		} catch {}
	}, [value]);

	return <React.Fragment />;
}
