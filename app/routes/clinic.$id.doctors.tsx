import { LoaderFunctionArgs } from "@remix-run/node";
import { useNavigation, useParams } from "@remix-run/react";
import { getPaginationState } from "~/components/pagination";
import { authenticator } from "~/services/auth.server";
import DoctorsTable from "~/tables/doctors";
import { db } from "~/utils/db.server";

export async function loader({ request, params }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  const query = url.searchParams.get("query") ?? "";

  const user = await authenticator.isAuthenticated(request, {
    failureRedirect: "/login",
  });

  const where = { worksAt: { some: { id: params.id } } };
  const [queryParams, pagination] = await getPaginationState(
    request,
    db.doctor.count({ where }),
    13
  );

  const doctors = await db.doctor.findMany({
    ...queryParams,
    where: {
      AND: [where],
    },
  });

  return { user, pagination, doctors };
}

export default function ClinicDashboard() {
  const { id } = useParams();

  return (
    <div>
      <DoctorsTable clinic={id} redirectTo={`/clinic/${id}/doctors`} />
    </div>
  );
}
