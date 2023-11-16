import { PencilIcon, PlusIcon, TrashIcon } from "@heroicons/react/24/solid";
import type { ClinicPlan, Doctor } from "@prisma/client";
import { useLoaderData } from "@remix-run/react";
import Button from "~/components/button";
import DeleteModal from "~/components/deleteModal";
import Pagination from "~/components/pagination";
import { ClinicPlanDialog } from "~/dialogs/clinicPlan";
import type { WithSerializedTypes } from "~/utils/client";
import { useDialog } from "~/utils/dialog";

interface Data {
  clinicPlans: ClinicPlan & { doctor: Doctor }[];
  doctors: Doctor[];
}

export default function ClinicPlansTable(p: { clinic: string }) {
  const { clinicPlans, doctors } = useLoaderData<Data>();
  const [isModalOpen, clinicPlan, openModal, onCloseModal] =
    useDialog<WithSerializedTypes<ClinicPlan>>();
  const [isRemoveOpen, clinicPlanToRemove, removeClinicPlan, onCloseRemove] =
    useDialog<string>();

  return (
    <div className="flex flex-col">
      <div className="table mx-4">
        <table>
          <thead>
            <tr>
              <th className="">Nome</th>
              <th className="">Dottore</th>
            </tr>
          </thead>
          <tbody>
            {clinicPlans.map((u) => (
              <tr key={u.id}>
                <td className="">{u.name}</td>
                <td className="">
                  {u.doctor.firstName} {u.doctor.lastName}
                </td>
                <td className="flex gap-x-2">
                  <Button
                    onClick={() => openModal(u)}
                    small
                    text="Modifica"
                    icon={<PencilIcon />}
                  />
                  <Button
                    onClick={() => removeClinicPlan(u.id)}
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
      <ClinicPlanDialog
        isOpen={isModalOpen}
        doctors={doctors}
        onClose={onCloseModal}
        clinicId={p.clinic}
        clinicPlan={clinicPlan}
      />

      <DeleteModal
        id={clinicPlanToRemove ?? ""}
        isOpen={isRemoveOpen}
        action="/clinicPlan/upsert"
        onClose={onCloseRemove}
      />
    </div>
  );
}
