import { PlusIcon, XMarkIcon } from "@heroicons/react/24/solid";
import type { Clinic } from "@prisma/client";
import { Form } from "@remix-run/react";
import type { WithSerializedTypes } from "~/utils/client";
import Button from "~/components/button";
import Overlay, { DialogCloseOnSubmit } from "~/components/overlay";
import Field from "~/components/field";
import { ValidatedForm } from "remix-validated-form";
import { validator } from "~/validators/clinic";

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
        <h2>{isNew ? "Aggiungi Clinica" : "Modifica Clinica"}</h2>
        <XMarkIcon className="close-button" onClick={p.onClose} />

        <ValidatedForm
          method="post"
          key={p.clinic?.id}
          validator={validator}
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

            <Field
              name="name"
              label="Nome"
              helperText="Il nome della clinica."
            />
            <Field name="address" label="Indirizzo" />
            <Field name="city" label="Città" />
            <Field
              name="province"
              label="Provincia"
              inputProps={{ maxLength: 2 }}
            />
            <Field
              name="postalCode"
              label="CAP"
              inputProps={{ maxLength: 5 }}
            />
          </div>

          <div className="p-4 pb-2">
            <Button
              intent="primary"
              className="w-full"
              type="submit"
              text={isNew ? "Aggiungi Clinica" : "Modifica Clinica"}
              icon={<PlusIcon />}
            />
          </div>
        </ValidatedForm>
      </div>
    </Overlay>
  );
}
