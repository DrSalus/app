import { PlusIcon, XMarkIcon } from "@heroicons/react/24/solid";
import type { ClinicalService, Doctor, ServiceOffering } from "@prisma/client";
import type { WithSerializedTypes } from "~/utils/client";
import Button from "~/components/button";
import Overlay, { DialogCloseOnSubmit } from "~/components/overlay";
import { ValidatedForm } from "remix-validated-form";
import { validator } from "~/validators/serviceOffering";
import InputField from "~/components/fields/inputField";
import { last } from "lodash-es";
import { v4 } from "uuid";
import { useMatches } from "@remix-run/react";
import SelectField from "~/components/fields/selectField";
import DoctorField from "~/components/fields/doctorField";
import ServiceTypeField from "~/components/fields/serviceTypeField";
import ServiceField from "~/components/fields/serviceField";
import { useMemo } from "react";

export function OfferingDialog(p: {
	serviceOffering?: WithSerializedTypes<ServiceOffering | null>;
	redirectTo?: string;
	clinicId: string;
	doctors: WithSerializedTypes<Doctor>[];
	services: WithSerializedTypes<ClinicalService>[];
	isOpen: boolean;
	onClose?: () => void;
}) {
	const isNew = p.serviceOffering == null;
	const matches = useMatches();
	const redirectTo = p.redirectTo ?? last(matches)?.pathname;

	const key = useMemo(
		() => p.serviceOffering?.id ?? v4(),
		[p.isOpen, p.serviceOffering],
	);

	return (
		<Overlay isOpen={p.isOpen}>
			<div className="card w-3/5 z-10">
				<h2>{isNew ? "Aggiungi Prestazione" : "Modifica Prestazione"}</h2>
				<XMarkIcon className="close-button" onClick={p.onClose} />

				<ValidatedForm
					method="post"
					key={key}
					validator={validator}
					resetAfterSubmit={true}
					defaultValues={p.serviceOffering ?? {}}
					encType="multipart/form-data"
					action="/serviceOffering/upsert"
				>
					<DialogCloseOnSubmit onClose={p.onClose} />
					<div className="form-grid px-4 pt-4">
						<input
							type="hidden"
							value={isNew ? "create" : "update"}
							name="_action"
						/>
						<input type="hidden" name="_redirect" value={redirectTo} />
						<input type="hidden" name="_id" value={p.serviceOffering?.id} />
						<input type="hidden" name="clinicId" value={p.clinicId} />

						<ServiceTypeField />
						<DoctorField doctors={p.doctors} />

						<ServiceField services={p.services} />
						<InputField
							inputProps={{ type: "number" }}
							name="amount"
							label="Amount"
						/>
						<InputField
							inputProps={{ type: "number" }}
							name="duration"
							label="Duration"
						/>
					</div>

					<div className="p-4 pb-2">
						<Button
							intent="primary"
							className="w-full"
							type="submit"
							text={isNew ? "Aggiungi Prestazione" : "Modifica Prestazione"}
							icon={<PlusIcon />}
						/>
					</div>
				</ValidatedForm>
			</div>
		</Overlay>
	);
}
