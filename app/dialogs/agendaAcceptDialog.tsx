import { CheckIcon, PlusIcon, XMarkIcon } from "@heroicons/react/24/solid";
import Overlay, { DialogCloseOnSubmit } from "../components/overlay";
import { ValidatedForm } from "remix-validated-form";
import { validator } from "~/validators/acceptance";
import Field from "~/components/field";
import InputField from "~/components/fields/inputField";
import Button from "~/components/button";
import { v4 } from "uuid";
import { useMemo } from "react";
import { AgendaBooking } from "~/services/agendas";
import { DateTime } from "luxon";
import Show from "~/components/show";
import Callout from "~/components/callout";

export function AgendaAcceptDialog(p: {
	isOpen: boolean;
	booking: AgendaBooking;
	redirectTo?: string;
	onClose: () => void;
}) {
	const key = useMemo(() => p.booking?.id ?? v4(), [p.booking?.id, p.isOpen]);
	const isToday = DateTime.fromISO(p.booking?.bookedAt ?? "").hasSame(
		DateTime.now(),
		"day",
	);
	return (
		<Overlay isOpen={p.isOpen}>
			<div className="card w-3/5 z-10">
				<h2>Accettazione</h2>
				<XMarkIcon className="close-button" onClick={p.onClose} />
				<ValidatedForm
					method="post"
					key={key}
					validator={validator}
					defaultValues={
						p.booking != null
							? {
									bookingId: p.booking.id,
									date: new Date().toISOString(),
									firstName: p.booking.patient.firstName,
									lastName: p.booking.patient.lastName,
									fiscalCode: p.booking.patient.fiscalCode ?? "",
							  }
							: {}
					}
					encType="multipart/form-data"
					action="/booking/accept"
				>
					<DialogCloseOnSubmit onClose={p.onClose} />

					<div className="form-grid px-4 pt-4">
						<input type="hidden" name="_redirect" value={p.redirectTo} />
						<input type="hidden" name="bookingId" value={p.booking?.id} />
						<input type="hidden" name="date" value={new Date().toISOString()} />
						<InputField name="firstName" label="Nome" />
						<InputField name="lastName" label="Cognome" />
						<InputField name="fiscalCode" label="Codice Fiscale" />
					</div>
					<Show unless={isToday}>
						<Callout
							text="Attenzione: La data di accettazione non corrisponde a oggi, asicurati di aver verificato i dati della prenotazione."
							intent="warning"
						/>
					</Show>
					<div className="p-4 pb-2">
						<Button
							intent="primary"
							className="w-full"
							type="submit"
							text={"Completa Accettazione"}
							icon={<CheckIcon />}
						/>
					</div>
				</ValidatedForm>
			</div>
		</Overlay>
	);
}
