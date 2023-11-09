import {
  MagnifyingGlassIcon,
  PencilIcon,
  PlusIcon,
  TrashIcon,
} from "@heroicons/react/24/solid";
import type { Clinic, Patient } from "@prisma/client";
import type { LoaderFunctionArgs } from "@remix-run/node";
import { Form, useLoaderData } from "@remix-run/react";
import Button from "~/components/button";
import DeleteModal from "~/components/deleteModal";
import Pagination, { getPaginationState } from "~/components/pagination";
import { ClinicDialog } from "~/dialogs/clinicDialog";
import { PatientDialog } from "~/dialogs/patientDialog";
import { authenticator } from "~/services/auth.server";
import type { WithSerializedTypes } from "~/utils/client";
import { db } from "~/utils/db.server";
import { useDialog } from "~/utils/dialog";

export async function loader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  const query = url.searchParams.get("query") ?? "";

  const user = await authenticator.isAuthenticated(request, {
    failureRedirect: "/login",
  });

  const [queryParams, pagination] = await getPaginationState(
    request,
    db.patient.count(),
    13
  );

  const patients = await db.patient.findMany({
    ...queryParams,
  });

  return { user, pagination, patients };
}

export default function Patients() {
  const { patients } = useLoaderData<typeof loader>();
  const [isModalOpen, patient, openModal, onCloseModal] =
    useDialog<WithSerializedTypes<Patient>>();
  const [isRemoveOpen, patientToRemove, removePatient, onCloseRemove] =
    useDialog<string>();

  return (
    <div className="flex flex-col pt-4">
      <div className="search-bar-container">
        <Form className="search-bar">
          <input
            type="text"
            name="query"
            defaultValue={""}
            placeholder="Cerca cliniche..."
          />
          <button type="submit">
            <MagnifyingGlassIcon className="h-6 px-2 text-sky-800" />
          </button>
        </Form>
        <Button
          onClick={() => openModal()}
          intent="primary"
          text="Aggiungi Pazeinte"
          icon={<PlusIcon />}
        />
      </div>
      <div className="table mx-6">
        <table>
          <thead>
            <tr>
              <th className="">Nome</th>
              <th className="">Cognome</th>
              <th className="">Cod. Fiscale</th>
              <th className="w-2">Azioni</th>
            </tr>
          </thead>
          <tbody>
            {patients.map((u) => (
              <tr key={u.id}>
                <td className="font-medium">{u.firstName}</td>
                <td className="font-medium">{u.lastName}</td>
                <td className="text-gray-800">
                  {u.fiscalCode}
                </td>
                <td className="flex gap-x-2">
                  <Button
                    onClick={() => openModal(u)}
                    small
                    text="Modifica"
                    icon={<PencilIcon />}
                  />
                  <Button
                    onClick={() => removePatient(u.id)}
                    small
                    intent="danger"
                    text="Rimuovi"
                    icon={<TrashIcon />}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Pagination />
      <PatientDialog
        isOpen={isModalOpen}
        patient={patient}
        redirectTo={`/patients`}
        onClose={onCloseModal}
      />
      <DeleteModal
        id={patientToRemove ?? ""}
        isOpen={isRemoveOpen}
        action="/patients/upsert"
        redirectTo={`/patients`}
        onClose={onCloseRemove}
      />
    </div>
  );
}
