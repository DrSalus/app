import {
  MagnifyingGlassIcon,
  PencilIcon,
  PlusIcon,
  TrashIcon,
} from "@heroicons/react/24/solid";
import { Doctor, DoctorSpecialty, Gender, type Patient } from "@prisma/client";
import { Form, useLoaderData } from "@remix-run/react";
import classNames from "classnames";
import { DateTime } from "luxon";
import Button from "~/components/button";
import DeleteModal from "~/components/deleteModal";
import Pagination from "~/components/pagination";
import { DoctorDialog } from "~/dialogs/doctorDialog";
import type { WithSerializedTypes } from "~/utils/client";
import { useDialog } from "~/utils/dialog";

type D = Doctor & { specialities: DoctorSpecialty[] };

interface Data {
  doctors: D[];
  specialities: DoctorSpecialty[];
}

export default function DoctorsTable(p: {
  clinic?: string;
  filterable?: boolean;
  redirectTo?: string;
}) {
  const { doctors, specialities } = useLoaderData<Data>();
  const [isModalOpen, doctor, openModal, onCloseModal] =
    useDialog<WithSerializedTypes<Doctor>>();
  const [isRemoveOpen, doctorToRemove, removeDoctor, onCloseRemove] =
    useDialog<string>();

  return (
    <div className="flex flex-col">
      <div className="table mx-4">
        <table>
          <thead>
            <tr>
              <th className="">Nome</th>
              <th className="">Cognome</th>
              <th className="">Specializzazioni</th>
              <th className="w-2">Azioni</th>
            </tr>
          </thead>
          <tbody>
            {doctors.map((u) => (
              <tr key={u.id}>
                <td className="">{u.firstName}</td>
                <td className="">{u.lastName}</td>
                <td className="">
                  {u.specialities.map((d) => d.name).join(", ")}
                </td>
                <td className="flex gap-x-2">
                  <Button
                    onClick={() => openModal(u)}
                    small
                    text="Modifica"
                    icon={<PencilIcon />}
                  />
                  <Button
                    onClick={() => removeDoctor(u.id)}
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
      <Pagination
        primaryButton={
          <Button
            onClick={() => openModal()}
            intent="primary"
            small
            text="Aggiungi"
            icon={<PlusIcon />}
          />
        }
      />
      <DoctorDialog
        isOpen={isModalOpen}
        worksAt={p.clinic}
        doctor={doctor}
        specialities={specialities}
        onClose={onCloseModal}
      />
      <DeleteModal
        id={doctorToRemove ?? ""}
        isOpen={isRemoveOpen}
        action="/doctors/upsert"
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
