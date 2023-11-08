import {
  MagnifyingGlassIcon,
  PencilIcon,
  PlusIcon,
  TrashIcon,
} from "@heroicons/react/24/solid";
import type { Clinic } from "@prisma/client";
import type { LoaderFunctionArgs } from "@remix-run/node";
import { Form, useLoaderData } from "@remix-run/react";
import Button from "~/components/button";
import DeleteModal from "~/components/deleteModal";
import Pagination, { getPaginationState } from "~/components/pagination";
import { ClinicDialog } from "~/dialogs/clinicDialog";
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

  const clinics = await db.clinic.findMany({
    ...queryParams,
  });

  return { user, pagination, clinics };
}

export default function Clinics() {
  const { clinics } = useLoaderData<typeof loader>();
  const [isModalOpen, clinic, openModal, onCloseModal] =
    useDialog<WithSerializedTypes<Clinic>>();
  const [isRemoveOpen, clinicToRemove, removeClinic, onCloseRemove] =
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
          text="Aggiungi Clinica"
          icon={<PlusIcon />}
        />
      </div>
      <div className="table mx-6">
        <table>
          <thead>
            <tr>
              <th className="">Nome</th>
              <th className="">Indirizzo</th>
              <th className="w-2">Azioni</th>
            </tr>
          </thead>
          <tbody>
            {clinics.map((u) => (
              <tr key={u.id}>
                <td className="font-medium">{u.name}</td>
                <td className="text-gray-800">
                  {u.address}, {u.city}
                </td>
                <td className="flex gap-x-2">
                  <Button
                    onClick={() => openModal(u)}
                    small
                    text="Modifica"
                    icon={<PencilIcon />}
                  />
                  <Button
                    onClick={() => removeClinic(u.id)}
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
      <ClinicDialog
        isOpen={isModalOpen}
        clinic={clinic}
        redirectTo={`/clinics`}
        onClose={onCloseModal}
      />
      <DeleteModal
        id={clinicToRemove ?? ""}
        isOpen={isRemoveOpen}
        action="/clinics/upsert"
        redirectTo={`/clinics`}
        onClose={onCloseRemove}
      />
    </div>
  );
}
