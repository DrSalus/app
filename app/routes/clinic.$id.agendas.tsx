import type { LoaderFunctionArgs } from "@remix-run/node";
import { useParams } from "@remix-run/react";
import { getPaginationState } from "~/components/pagination";
import AgendasTable from "~/tables/agendas";
import { db } from "~/utils/db.server";

export async function loader({ request, params }: LoaderFunctionArgs) {
  const where = { clinicId: params.id };
  const [queryParams, pagination] = await getPaginationState(
    request,
    db.agenda.count({ where }),
    13
  );
  const agendas = await db.agenda.findMany({
    ...queryParams,
    include: {
      doctor: true,
      services: true,
      plans: {
        take: 1,
      },
    },
    where: {
      AND: [where],
    },
  });
  const services = await db.serviceOffering.findMany({
    where: {
      clinicId: params.id,
    },
    include: {
      service: true,
    },
  });
  const doctors = await db.doctor.findMany({
    ...queryParams,

    where: {
      worksAt: {
        some: {
          id: params.id,
        },
      },
    },
  });
  return { agendas, services, pagination, doctors };
}

export default function ClinicDashboard() {
  const { id } = useParams();
  return (
    <div>
      <AgendasTable clinic={id!} />
    </div>
  );
}
