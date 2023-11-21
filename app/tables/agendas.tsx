import { PencilIcon, PlusIcon, TrashIcon } from "@heroicons/react/24/solid";
import type { Agenda, ClinicalService, Doctor } from "@prisma/client";
import { useLoaderData } from "@remix-run/react";
import Button from "~/components/button";
import DeleteModal from "~/components/deleteModal";
import Pagination from "~/components/pagination";
import { AgendaDialog } from "~/dialogs/agenda";
import { loader } from "~/routes/clinic.$id.agendas";
import type { WithSerializedTypes } from "~/utils/client";
import { useDialog } from "~/utils/dialog";


export default function AgendasTable(p: { clinic: string }) {
  const { agendas, services, doctors } = useLoaderData<typeof loader>();
  const [isModalOpen, agenda, openModal, onCloseModal] =
    useDialog<WithSerializedTypes<Agenda>>();
  const [isRemoveOpen, agendaToRemove, removeAgenda, onCloseRemove] =
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
            {agendas?.map((u) => (
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
                    onClick={() => removeAgenda(u.id)}
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
      <AgendaDialog
        isOpen={isModalOpen}
        doctors={doctors}
        services={services}
        onClose={onCloseModal}
        clinicId={p.clinic}
        agenda={agenda}
      />

      <DeleteModal
        id={agendaToRemove ?? ""}
        isOpen={isRemoveOpen}
        action="/agendas/upsert"
        onClose={onCloseRemove}
      />
    </div>
  );
}
