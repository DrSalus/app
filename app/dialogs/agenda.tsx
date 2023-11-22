import { PlusIcon, XMarkIcon } from "@heroicons/react/24/solid";
import { ServiceType, type Agenda, type Doctor, ClinicalService, ServiceOffering } from "@prisma/client";
import type { WithSerializedTypes } from "~/utils/client";
import Button from "~/components/button";
import Overlay, { DialogCloseOnSubmit } from "~/components/overlay";
import { ValidatedForm } from "remix-validated-form";
import { validator } from "~/validators/agenda";
import InputField from "~/components/fields/inputField";
import { last } from "lodash-es";
import { v4 } from "uuid";
import { useMatches } from "@remix-run/react";
import SelectField from "~/components/fields/selectField";
import DoctorField from "~/components/fields/doctorField";
import ServiceTypeField from "~/components/fields/serviceTypeField";
import ServicesField from "~/components/fields/servicesField";

export function AgendaDialog(p: {
  agenda?: WithSerializedTypes<Agenda | null>;
  doctors: Doctor[];
  services: WithSerializedTypes<ServiceOffering & { service: ClinicalService }>[];
  redirectTo?: string;
  clinicId: string;
  isOpen: boolean;
  onClose?: () => void;
}) {
  const isNew = p.agenda == null;
  const matches = useMatches();
  const redirectTo = p.redirectTo ?? last(matches)?.pathname;

  return (
    <Overlay isOpen={p.isOpen}>
      <div className="card w-3/5 z-10">
        <h2>{isNew ? "Aggiungi Agenda" : "Modifica Agenda"}</h2>
        <XMarkIcon className="close-button" onClick={p.onClose} />

        <ValidatedForm
          method="post"
          key={p.agenda?.id ?? v4()}
          validator={validator}
          resetAfterSubmit={true}
          defaultValues={p.agenda ?? {}}
          encType="multipart/form-data"
          action="/agendas/upsert"
        >
          <DialogCloseOnSubmit onClose={p.onClose} />
          <div className="form-grid px-4 pt-4">
            <input
              type="hidden"
              value={isNew ? "create" : "update"}
              name="_action"
            />
            <input type="hidden" name="_redirect" value={redirectTo} />
            <input type="hidden" name="_id" value={p.agenda?.id} />
            <input type="hidden" name="clinicId" value={p.agenda?.clinicId ?? p.clinicId} />
            <InputField name="name" label="Nome" />
            <ServiceTypeField />
            <DoctorField doctors={p.doctors} />
            <InputField name="validFrom" label="Valido dal" inputProps={{ type: 'date' }} />
            <InputField name="validUntil" label="Valido fino a" inputProps={{ type: 'date' }} />
            <ServicesField name="services" services={p.services} />

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
