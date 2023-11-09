import { PlusIcon, XMarkIcon } from "@heroicons/react/24/solid";
import type { Clinic, Patient } from "@prisma/client";
import { Form } from "@remix-run/react";
import type { WithSerializedTypes } from "~/utils/client";
import Button from "~/components/button";
import Overlay, { DialogCloseOnSubmit } from "~/components/overlay";
import Field from "~/components/field";
import { ValidatedForm } from "remix-validated-form";
import { validator } from "~/validators/patient";

export function PatientDialog(p: {
  patient?: WithSerializedTypes<Patient | null>;
  redirectTo?: string;
  isOpen: boolean;
  onClose?: () => void;
}) {
  const isNew = p.patient == null;

  return (
    <Overlay isOpen={p.isOpen}>
      <div className="card w-3/5 z-10">
        <h2>{isNew ? "Aggiungi Paziente" : "Modifica Paziente"}</h2>
        <XMarkIcon className="close-button" onClick={p.onClose} />

        <ValidatedForm
          method="post"
          key={p.patient?.id}
          validator={validator}
          resetAfterSubmit={true}
          defaultValues={p.patient ?? {}}
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

            <Field
              name="firstName"
              label="Nome"
            />
           
            <Field
              name="lastName"
              label="Cognome"
            />
           
            <Field
              name="gender"
              label="Genere"
            />
            <Field
              name="fiscalCode"
              label="Codice Fiscale"
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
