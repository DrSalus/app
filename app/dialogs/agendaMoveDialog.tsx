import { CheckIcon, PlusIcon, XMarkIcon } from "@heroicons/react/24/solid";
import Overlay, { DialogCloseOnSubmit } from "../components/overlay";
import { ValidatedForm } from "remix-validated-form";
import { validator } from "~/validators/move";
import Field from "~/components/field";
import InputField from "~/components/fields/inputField";
import Button from "~/components/button";
import { AgendaBooking } from "~/routes/clinic.$id.agenda.$agendaId";
import { v4 } from "uuid";
import { getDisplayName } from "~/utils/patient";
import { DateTime } from "luxon";
import { useMemo } from "react";

export function AgendaMoveDialog(p: {
	isOpen: boolean;
	booking: AgendaBooking;
	redirectTo?: string;
	onClose: () => void;
}) {
	const key = useMemo(() => p.booking?.id ?? v4(), [p.booking?.id, p.isOpen]);
	return (
		<Overlay isOpen={p.isOpen}>
			<div className="card w-3/5 z-10">
				<h2>Sposta Prenotazione</h2>
				<XMarkIcon className="close-button" onClick={p.onClose} />
				<ValidatedForm
					method="post"
					key={key}
					validator={validator}
					defaultValues={
						p.booking != null
							? {
									bookingId: p.booking.id,
									bookedAt: p.booking.bookedAt,
							  }
							: {}
					}
					encType="multipart/form-data"
					action="/booking/move"
				>
					<DialogCloseOnSubmit onClose={p.onClose} />

					<div className="form-grid px-4 pt-4">
						<input type="hidden" name="_redirect" value={p.redirectTo} />
						<input type="hidden" name="bookingId" value={p.booking?.id} />
						<input type="hidden" name="date" value={new Date().toISOString()} />
						<InputField
							name="patient"
							label="Paziente"
							inputProps={{ readOnly: true }}
							value={p.booking ? getDisplayName(p.booking.patient) : ""}
						/>
						<InputField
							inputProps={{ type: "datetime-local" }}
							name="bookedAt"
							label="Prenotazione"
						/>
					</div>
					<div className="p-4 pb-2">
						<Button
							intent="primary"
							className="w-full"
							type="submit"
							text={"Aggiorna Prenotazione"}
							icon={<CheckIcon />}
						/>
					</div>
				</ValidatedForm>
			</div>
		</Overlay>
	);
}
