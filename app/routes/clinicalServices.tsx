import {
  MagnifyingGlassIcon,
  PencilIcon,
  PlusIcon,
  TrashIcon,
} from "@heroicons/react/24/solid";
import type { Clinic, ClinicalService } from "@prisma/client";
import type { LoaderFunctionArgs } from "@remix-run/node";
import { Form, useLoaderData } from "@remix-run/react";
import Button from "~/components/button";
import DeleteModal from "~/components/deleteModal";
import Pagination, { getPaginationState } from "~/components/pagination";
import { ClinicDialog } from "~/dialogs/clinicDialog";
import { ClinicalServiceDialog } from "~/dialogs/clinicalServiceDialog";
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
    db.clinic.count(),
    13
  );

  const clinicalServices = await db.clinicalService.findMany({
    ...queryParams,
  });

  return { user, pagination, clinicalServices };
}

export default function ClinicalService() {
  const { clinicalServices } = useLoaderData<typeof loader>();
  const [isModalOpen, clinicalService, openModal, onCloseModal] =
    useDialog<WithSerializedTypes<ClinicalService>>();
  const [
    isRemoveOpen,
    clinicalServiceToRemove,
    removeClinicalService,
    onCloseRemove,
  ] = useDialog<string>();

  return (
    <div className="flex flex-col pt-4">
      <div className="search-bar-container">
        <Form className="search-bar">
          <input
            type="text"
            name="query"
            defaultValue={""}
            placeholder="Cerca prestazioni..."
          />
          <button type="submit">
            <MagnifyingGlassIcon className="h-6 px-2 text-sky-800" />
          </button>
        </Form>
        <Button
          onClick={() => openModal()}
          intent="primary"
          text="Aggiungi Clinica"
          icon={<PlusIcon />}
        />
      </div>
      <div className="table mx-6">
        <table>
          <thead>
            <tr>
              <th className="w-16">Branca</th>
              <th className="w-24">Nomenclatura</th>
              <th className="w-28">Cod. LEA</th>
              <th className="">Nome</th>
              <th className="w-2">Azioni</th>
            </tr>
          </thead>
          <tbody>
            {clinicalServices.map((u) => (
              <tr key={u.id}>
                <td>{u.branchCode}</td>
                <td className="text-gray-600">{u.nomenCode}</td>
                <td className="text-gray-600">{u.leaCode}</td>
                <td className="font-medium">{u.name}</td>
                <td className="flex gap-x-2">
                  <Button
                    onClick={() => openModal(u)}
                    small
                    text="Modifica"
                    icon={<PencilIcon />}
                  />
                  <Button
                    onClick={() => removeClinicalService(u.id)}
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
      <ClinicalServiceDialog
        isOpen={isModalOpen}
        clinicalService={clinicalService}
        redirectTo={`/clinicalService`}
        onClose={onCloseModal}
      />
      <DeleteModal
        id={clinicalServiceToRemove ?? ""}
        isOpen={isRemoveOpen}
        action="/clinicalService/upsert"
        redirectTo={`/clinicalService`}
        onClose={onCloseRemove}
      />
    </div>
  );
}
