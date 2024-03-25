import {
	MagnifyingGlassIcon,
	PencilIcon,
	PlusIcon,
	TrashIcon,
} from "@heroicons/react/24/solid";
import { Gender, type Patient } from "@prisma/client";
import type { LoaderFunctionArgs } from "@remix-run/node";
import { Form, useLoaderData, useSearchParams } from "@remix-run/react";
import classNames from "classnames";
import { DateTime } from "luxon";
import React from "react";
import Button from "~/components/button";
import DeleteModal from "~/components/deleteModal";
import Pagination, { getPaginationState } from "~/components/pagination";
import { PatientDialog } from "~/dialogs/patientDialog";
import { authenticator } from "~/services/auth.server";
import PatientsTable from "~/tables/patients";
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
		20,
	);

	const patients = await db.patient.findMany({
		...queryParams,
		orderBy: [{ firstName: "asc" }, { lastName: "asc" }],
		where: {
			OR: [
				{
					firstName: {
						contains: query,
						mode: "insensitive",
					},
				},
				{
					lastName: {
						contains: query,
						mode: "insensitive",
					},
				},
				{
					fiscalCode: {
						contains: query,
						mode: "insensitive",
					},
				},
			],
		},
	});

	return { user, pagination, patients };
}

export default function Patients() {
	return <PatientsTable />;
}
