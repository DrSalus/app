import { PlusIcon, XMarkIcon } from "@heroicons/react/24/solid";
import type { ClinicalService } from "@prisma/client";
import type { WithSerializedTypes } from "~/utils/client";
import Button from "~/components/button";
import Overlay, { DialogCloseOnSubmit } from "~/components/overlay";
import Field from "~/components/field";
import { ValidatedForm } from "remix-validated-form";
import { validator } from "~/validators/clinicalService";
import InputField from "~/components/fields/inputField";
import { v4 } from "uuid";

export function ClinicalServiceDialog(p: {
  clinicalService?: WithSerializedTypes<ClinicalService | null>;
  redirectTo?: string;
  isOpen: boolean;
  onClose?: () => void;
}) {
  const isNew = p.clinicalService == null;

  return (
    <Overlay isOpen={p.isOpen}>
      <div className="card w-3/5 z-10">
        <h2>{isNew ? "Aggiungi Prestazione" : "Modifica Prestazione"}</h2>
        <XMarkIcon className="close-button" onClick={p.onClose} />

        <ValidatedForm
          method="post"
          key={p.clinicalService?.id ?? v4()}
          validator={validator}
          defaultValues={p.clinicalService ?? {}}
          encType="multipart/form-data"
          action="/clinicalServices/upsert"
        >
          <DialogCloseOnSubmit onClose={p.onClose} />
          <div className="form-grid px-4 pt-4">
            <input
              type="hidden"
              value={isNew ? "create" : "update"}
              name="_action"
            />
            <input type="hidden" name="_redirect" value={p.redirectTo} />
            <input type="hidden" name="_id" value={p.clinicalService?.id} />

            <InputField
              name="name"
              label="Nome"
              helperText="Il nome della prestazione."
            />
            <InputField
              name="nomenCode"
              label="Codice Nazionale"
              helperText="Il codice nomenclatore nazionale secondo il DM 2012."
            />
            <InputField
              name="branchCode"
              label="Codice Branca"
              helperText="Il codice della branca di riferimento."
            />
            <InputField
              name="leaCode"
              label="Codice LEA"
              helperText="Il nuovo codice LEA."
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
