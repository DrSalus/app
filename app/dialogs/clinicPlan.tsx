import { PlusIcon, XMarkIcon } from "@heroicons/react/24/solid";
import type { ClinicPlan, Doctor } from "@prisma/client";
import type { WithSerializedTypes } from "~/utils/client";
import Button from "~/components/button";
import Overlay, { DialogCloseOnSubmit } from "~/components/overlay";
import { ValidatedForm } from "remix-validated-form";
import { validator } from "~/validators/clinicPlan";
import InputField from "~/components/fields/inputField";
import { last } from "lodash-es";
import { v4 } from "uuid";
import { useMatches } from "@remix-run/react";
import SelectField from "~/components/fields/selectField";
import DoctorField from "~/components/fields/doctorField";

export function ClinicPlanDialog(p: {
  clinicPlan?: WithSerializedTypes<ClinicPlan | null>;
  doctors: Doctor[];
  redirectTo?: string;
  clinicId: string;
  isOpen: boolean;
  onClose?: () => void;
}) {
  const isNew = p.clinicPlan == null;
  const matches = useMatches();
  const redirectTo = p.redirectTo ?? last(matches)?.pathname;

  return (
    <Overlay isOpen={p.isOpen}>
      <div className="card w-3/5 z-10">
        <h2>{isNew ? "Aggiungi Agenda" : "Modifica Agenda"}</h2>
        <XMarkIcon className="close-button" onClick={p.onClose} />

        <ValidatedForm
          method="post"
          key={p.clinicPlan?.id ?? v4()}
          validator={validator}
          resetAfterSubmit={true}
          defaultValues={p.clinicPlan ?? {}}
          encType="multipart/form-data"
          action="/clinicPlan/upsert"
        >
          <DialogCloseOnSubmit onClose={p.onClose} />
          <div className="form-grid px-4 pt-4">
            <input
              type="hidden"
              value={isNew ? "create" : "update"}
              name="_action"
            />
            <input type="hidden" name="_redirect" value={redirectTo} />
            <input type="hidden" name="_id" value={p.clinicPlan?.id} />
            <input type="hidden" name="clinicId" value={p.clinicId} />

            <DoctorField doctors={p.doctors} />

            <InputField name="name" label="Nome" />
          </div>

          <div className="p-4 pb-2">
            <Button
              intent="primary"
              className="w-full"
              type="submit"
              text={isNew ? "Aggiungi Agenda" : "Modifica Agenda"}
              icon={<PlusIcon />}
            />
          </div>
        </ValidatedForm>
      </div>
    </Overlay>
  );
}
