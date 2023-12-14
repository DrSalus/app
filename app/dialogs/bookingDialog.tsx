import { PlusIcon, XMarkIcon } from "@heroicons/react/24/solid";
import type { WithSerializedTypes } from "~/utils/client";
import Button from "~/components/button";
import Overlay, { DialogCloseOnSubmit } from "~/components/overlay";
import { ValidatedForm } from "remix-validated-form";
import { validator } from "~/validators/booking";
import InputField from "~/components/fields/inputField";
import { v4 } from "uuid";
import { useMemo } from "react";
import SelectField from "~/components/fields/selectField";
import { AgendaWithPlans } from "./agenda";
import FormDebug from "~/components/formDebug";
import { DateTime } from "luxon";

export function BookingDialog(p: {
	redirectTo?: string;
	isOpen: boolean;
	slot?: string;
	agenda: WithSerializedTypes<AgendaWithPlans>;
	onClose?: () => void;
}) {
	const { isOpen } = p;
	// biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
	const key = useMemo(() => {
		return v4();
	}, [isOpen, p.slot]);
	const options =
		p.agenda.services?.map?.((s) => ({
			label: s.service.name,
			value: s.id,
		})) ?? [];
	return (
		<Overlay isOpen={p.isOpen}>
			<div className="card w-3/5 z-10">
				<h2>Nuova Prenotazione</h2>
				<XMarkIcon className="close-button" onClick={p.onClose} />

				<ValidatedForm
					method="post"
					key={key}
					validator={validator}
					resetAfterSubmit={true}
					defaultValues={{
						date:
							p.slot != null
								? DateTime.fromISO(p.slot).toFormat("yyyy-MM-dd'T'HH:mm:ss")
								: "",
					}}
					encType="multipart/form-data"
					action="/booking/upsert"
				>
					<DialogCloseOnSubmit onClose={p.onClose} />
					<div className="form-grid px-4 pt-4">
						<input type="hidden" value="create" name="_action" />
						<input type="hidden" name="_redirect" value={p.redirectTo} />
						<input type="hidden" name="agendaId" value={p.agenda.id} />
						<input type="hidden" name="clinicId" value={p.agenda.clinicId} />

						<InputField
							name="date"
							inputProps={{ type: "datetime-local" }}
							label="Orario"
						/>
						<InputField name="firstName" label="Nome" />
						<InputField name="lastName" label="Cognome" />
						<InputField name="emailAddress" label="Indirizzo Email" />
						<InputField name="phoneNumber" label="Numero di Telefono" />
						<SelectField
							name="serviceId"
							label="Servizio"
							options={[
								{
									value: "",
									label: "Seleziona un servizio...",
								},
								...options,
							]}
						/>
						{/* <FormDebug /> */}
					</div>

					<div className="p-4 pb-2">
						<Button
							intent="primary"
							className="w-full"
							type="submit"
							text={"Aggiungi Prenotazione"}
							icon={<PlusIcon />}
						/>
					</div>
				</ValidatedForm>
			</div>
		</Overlay>
	);
}
