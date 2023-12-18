import {
	MagnifyingGlassIcon,
	PencilIcon,
	PlusIcon,
	TrashIcon,
} from "@heroicons/react/24/solid";
import { Doctor, Gender, type Patient } from "@prisma/client";
import type { LoaderFunctionArgs } from "@remix-run/node";
import { Form, useLoaderData } from "@remix-run/react";
import classNames from "classnames";
import { DateTime } from "luxon";
import Button from "~/components/button";
import DeleteModal from "~/components/deleteModal";
import Header from "~/components/header";
import Pagination, { getPaginationState } from "~/components/pagination";
import { DoctorDialog } from "~/dialogs/doctorDialog";
import { authenticator } from "~/services/auth.server";
import DoctorsTable from "~/tables/doctors";
import type { WithSerializedTypes } from "~/utils/client";
import { db } from "~/utils/db.server";
import { useDialog } from "~/utils/dialog";
import { sendBookingConfirmation } from "~/utils/whatsapp";

export async function loader({ request }: LoaderFunctionArgs) {
	const url = new URL(request.url);
	const query = url.searchParams.get("query") ?? "";

	const user = await authenticator.isAuthenticated(request, {
		failureRedirect: "/login",
	});

	const [queryParams, pagination] = await getPaginationState(
		request,
		db.doctor.count(),
		13,
	);

	const specialities = await db.doctorSpecialty.findMany({});

	// sendBookingConfirmation({
	// 	address: "Via Peppiniello 24",
	// 	bookedAt: new Date().toISOString(),
	// 	clinic: "Clinica San Paolo",
	// 	name: "Daniele Finocchiaro",
	// 	recipient: "393271686940",
	// 	service: "Visita Medica",
	// })
	// 	.then((res) => {
	// 		console.log(res);
	// 	})
	// 	.catch((err) => {
	// 		console.error(err);
	// 	});

	const doctors = await db.doctor.findMany({
		...queryParams,
		include: {
			specialities: true,
		},
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
			],
		},
	});

	return { user, pagination, doctors, specialities };
}

export default function Doctors() {
	return (
		<div className="page">
			<div className="headed-card">
				<Header title="Lista Dottori" />
			</div>
			<DoctorsTable />
		</div>
	);
}
