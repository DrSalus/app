import {
  BookOpenIcon,
  PencilIcon,
  PlusIcon,
  TrashIcon,
} from "@heroicons/react/24/solid";
import type { Agenda, ClinicalService, Doctor } from "@prisma/client/edge";
import { useLoaderData, useNavigate } from "@remix-run/react";
import { DateTime } from "luxon";
import React from "react";
import Button, { LinkButton } from "~/components/button";
import DeleteModal from "~/components/deleteModal";
import Pagination from "~/components/pagination";
import { ServiceTypeTag } from "~/components/serviceTypeLabel";
import { AgendaDialog } from "~/dialogs/agenda";
import { loader } from "~/routes/clinic.$id.agendas";
import type { WithSerializedTypes } from "~/utils/client";
import { useDialog } from "~/utils/dialog";
import useStopPropagation from "~/utils/events";
import { getDisplayName } from "~/utils/patient";

export default function AgendasTable(p: { clinic: string }) {
  const { agendas, services, doctors } = useLoaderData<typeof loader>();
  const [isModalOpen, agenda, openModal, onCloseModal] =
    useDialog<WithSerializedTypes<Agenda>>();
  const [isRemoveOpen, agendaToRemove, removeAgenda, onCloseRemove] =
    useDialog<string>();
  const navigate = useNavigate();
  const stopProgation = useStopPropagation();

  return (
    <div className="flex flex-col">
      <div className="table mx-4">
        <table>
          <thead>
            <tr>
              <th className="w-52">Tipo</th>
              <th className="">Nome</th>
              <th className="">Valido</th>
              <th className="">Prestazioni</th>
              <th className="w-44">Azioni</th>
            </tr>
          </thead>
          <tbody>
            {agendas?.map((u) => (
              <tr
                key={u.id}
                onClick={() => navigate(`/clinic/${u.clinicId}/agenda/${u.id}`)}
                className="cursor-pointer hover:bg-gray-100"
              >
                <td className="">
                  <div className="flex flex-col items-start">
                    <ServiceTypeTag type={u.type} />
                  </div>
                </td>
                <td className="">
                  {u.name}{" "}
                  {u.doctor != null ? (
                    <span className="italic text-gray-500">
                      - {getDisplayName(u.doctor)}
                    </span>
                  ) : (
                    ""
                  )}
                </td>

                <td className="w-64">
                  <div className="flex items-center gap-x-1.5">
                    {u.validFrom != null ? (
                      <>
                        <div className="text-gray-500">Dal</div>
                        <div>
                          {DateTime.fromISO(u.validFrom).toLocaleString(
                            DateTime.DATE_SHORT
                          )}
                        </div>
                      </>
                    ) : (
                      <React.Fragment />
                    )}
                    {u.validUntil != null ? (
                      <>
                        <div className="text-gray-500">al</div>
                        <div>
                          {DateTime.fromISO(u.validUntil).toLocaleString(
                            DateTime.DATE_SHORT
                          )}
                        </div>
                      </>
                    ) : (
                      <React.Fragment />
                    )}
                  </div>
                </td>
                <td className="">{u.services.length} Prestazioni</td>
                <td className="flex gap-x-2" {...stopProgation}>
                  <LinkButton
                    small
                    to={`/book/${u.id}`}
                    icon={<BookOpenIcon />}
                  />
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
