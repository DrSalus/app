import {
  MagnifyingGlassIcon,
  PencilIcon,
  PlusIcon,
  TrashIcon,
} from "@heroicons/react/24/solid";
import { Gender, type Patient } from "@prisma/client";
import type { LoaderFunctionArgs } from "@remix-run/node";
import { Form, useLoaderData } from "@remix-run/react";
import classNames from "classnames";
import { DateTime } from "luxon";
import Button from "~/components/button";
import DeleteModal from "~/components/deleteModal";
import Pagination, { getPaginationState } from "~/components/pagination";
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
    where: {
      OR: [
        {
          firstName: {
            contains: query,
          },
        },
        {
          lastName: {
            contains: query,
          },
        },
        {
          fiscalCode: {
            contains: query,
          },
        },
      ],
    },
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
              <th className="">Paziente</th>
              <th className="">Cod. Fiscale</th>
              <th className="">Data di Nascita</th>
              <th className="">Città di Nascita</th>
              <th className="w-2">Azioni</th>
            </tr>
          </thead>
          <tbody>
            {patients.map((u) => (
              <tr key={u.id}>
                <td className="font-medium">
                  <div className="flex text-bas font-medium items-center gap-x-1">
                    <div>{u.firstName}</div>
                    <div>{u.lastName}</div>
                    <div className="flex-grow" />
                    <PatientAge patient={u} />
                  </div>
                </td>
                <td className="text-gray-800">{u.fiscalCode}</td>
                <td className="text-gray-800">
                  <div className="flex items-center gap-x-2">
                    {DateTime.fromISO(u.birthDate).toLocaleString(
                      DateTime.DATE_MED
                    )}
                  </div>
                </td>
                <td className="text-gray-800">{u.birthCity}</td>
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

export function PatientAge(p: { patient: WithSerializedTypes<Patient> }) {
  const age = Math.floor(
    Math.abs(DateTime.fromISO(p.patient.birthDate).diffNow("years").years)
  );

  return (
    <div
      className={classNames(
        "flex rounded-lg px-2 text-sm font-semibold py-0.5",
        {
          "bg-blue-200 text-blue-600": p.patient.gender === Gender.MALE,
          "bg-pink-200 text-pink-600": p.patient.gender === Gender.FEMALE,
          "bg-gray-200 text-gray-800":
            p.patient.gender === Gender.NOT_SPECIFIED,
        }
      )}
    >
      {age} Anni
    </div>
  );
}
