import { MagnifyingGlassIcon } from "@heroicons/react/24/solid";
import { UserKind } from "@prisma/client";
import { LoaderFunctionArgs } from "@remix-run/node";
import { Form, useLoaderData, useSearchParams } from "@remix-run/react";
import { DateTime } from "luxon";
import Header from "~/components/header";
import Pagination, { getPaginationState } from "~/components/pagination";
import { ServiceTypeTag } from "~/components/serviceTypeLabel";
import { authenticator } from "~/services/auth.server";
import { db } from "~/utils/db.server";
import { getDisplayName } from "~/utils/patient";

export async function loader({ request, params }: LoaderFunctionArgs) {
	const user = await authenticator.isAuthenticated(request, {
		failureRedirect: "/login",
	});

  let where =  {
    patientId: params.id,
  }
  if (user.kind !== UserKind.ADMIN) {
    where.service = { clinicId: user.clinicId };
  }

 
	const [queryParams, pagination] = await getPaginationState(
		request,
		db.serviceBooking.count({ where }),
		20,
	);
  const patient = await db.patient.findUnique({ where: { id: params.id } })
  const bookings = await db.serviceBooking.findMany({
    ...queryParams,
    where,
    include: {
      service: {
        include: {
          service: true,
          doctor: true,
          clinic: true,
        }
      }
    }
  });

	return { user, bookings, patient, pagination };
}


export default function PatientSchedule() {
	const { bookings, patient } = useLoaderData<typeof loader>();
	const [search] = useSearchParams();

	return (
		<div className="flex flex-col">
      	<div className="headed-card">
				<Header title={getDisplayName(patient)}  />
			</div>
		
			<div className="table mx-4">
				<table>
					<thead>
						<tr>
							<th className="">Prestazione</th>
							<th className="">Dottore</th>
							<th className="">Orario</th>
							<th className="">Clinica</th>
							<th className="">Azioni</th>
						</tr>
					</thead>
					<tbody>
						{bookings.map((u) => (
							<tr key={u.id}>
								<td className="">
									<div className="flex items-center">
										<ServiceTypeTag type={u.service.service.type} />
									</div>
								</td>
                <td>{getDisplayName(u.service.doctor)}</td>

								<td className="">{u.service.service.name}</td>
								<td className="">{u.service.clinic.name}</td>
								<td className="">
									{DateTime.fromISO(u.bookedAt).toLocaleString(
										DateTime.DATETIME_MED,
									)}
								</td>
							</tr>
						))}
					</tbody>
				</table>
			</div>
			<Pagination />
		</div>
	);
}