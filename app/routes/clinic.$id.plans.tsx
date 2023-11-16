import type { LoaderFunctionArgs } from "@remix-run/node";
import { useParams } from "@remix-run/react";
import { getPaginationState } from "~/components/pagination";
import ClinicPlansTable from "~/tables/clinicPlans";
import { db } from "~/utils/db.server";

export async function loader({ request, params }: LoaderFunctionArgs) {
  const where = { clinicId: params.id };
  const [queryParams, pagination] = await getPaginationState(
    request,
    db.clinicPlan.count({ where }),
    13
  );
  const clinicPlans = await db.clinicPlan.findMany({
    ...queryParams,
    include: {
      doctor: true,
    },
    where: {
      AND: [where],
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
  return { clinicPlans, pagination, doctors };
}

export default function ClinicDashboard() {
  const { id } = useParams();
  return <ClinicPlansTable clinic={id!} />;
}
