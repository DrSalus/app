import { PlusIcon, XMarkIcon } from "@heroicons/react/24/solid";
import {
  Doctor,
  DoctorSpecialty,
  Gender,
  type Patient,
} from "@prisma/client/edge";
import type { WithSerializedTypes } from "~/utils/client";
import Button from "~/components/button";
import Overlay, { DialogCloseOnSubmit } from "~/components/overlay";
import {
  ValidatedForm,
  useControlField,
  useUpdateControlledField,
} from "remix-validated-form";
import { validator } from "~/validators/doctor";
import InputField from "~/components/fields/inputField";
import React, { useEffect } from "react";
import CodiceFiscale from "codice-fiscale-js";
import { DateTime } from "luxon";
import { last, upperFirst } from "lodash-es";
import { v4 } from "uuid";
import { useMatches } from "@remix-run/react";
import RelationshipField from "~/components/relationshipField";

export function DoctorDialog(p: {
  doctor?: WithSerializedTypes<Doctor | null>;
  redirectTo?: string;
  worksAt?: string;
  isOpen: boolean;
  specialities: WithSerializedTypes<DoctorSpecialty>[];
  onClose?: () => void;
}) {
  const isNew = p.doctor == null;
  const matches = useMatches();
  const redirectTo = p.redirectTo ?? last(matches)?.pathname;

  return (
    <Overlay isOpen={p.isOpen}>
      <div className="card w-3/5 z-10">
        <h2>{isNew ? "Aggiungi Dottore" : "Modifica Dottore"}</h2>
        <XMarkIcon className="close-button" onClick={p.onClose} />

        <ValidatedForm
          method="post"
          key={p.doctor?.id ?? v4()}
          validator={validator}
          resetAfterSubmit={true}
          defaultValues={p.doctor ?? {}}
          encType="multipart/form-data"
          action="/doctors/upsert"
        >
          <DialogCloseOnSubmit onClose={p.onClose} />
          <div className="form-grid px-4 pt-4">
            <input
              type="hidden"
              value={isNew ? "create" : "update"}
              name="_action"
            />
            <input type="hidden" name="_redirect" value={redirectTo} />
            <input type="hidden" name="_id" value={p.doctor?.id} />
            <input type="hidden" name="worksAt" value={p.worksAt} />

            <InputField name="firstName" label="Nome" />
            <InputField name="lastName" label="Cognome" />
            <InputField name="fiscalCode" label="Codice Fiscale" />
            <InputField name="email" label="Indirizzo Email" />
            <RelationshipField name="specialities" options={p.specialities} />
          </div>

          <div className="p-4 pb-2">
            <Button
              intent="primary"
              className="w-full"
              type="submit"
              text={isNew ? "Aggiungi Dottore" : "Modifica Dottore"}
              icon={<PlusIcon />}
            />
          </div>
        </ValidatedForm>
      </div>
    </Overlay>
  );
}
