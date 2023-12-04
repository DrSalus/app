import { BookOpenIcon, CalendarDaysIcon } from "@heroicons/react/24/outline";
import { LoaderFunctionArgs, json } from "@remix-run/node";
import NonIdealState from "~/components/nonIdealState";
import { authenticator } from "~/services/auth.server";
import { db } from "~/utils/db.server";

export async function loader({ request, params }: LoaderFunctionArgs) {
  const user = await authenticator.isAuthenticated(request, {
    failureRedirect: "/login",
  });

  const booking = await db.serviceBooking.findUnique({
    where: {
      id: params.id,
    },
  });
  return json({ booking });
}

export default function BookingConfirmed() {
  return (
    <div className="flex items-center justify-center">
      <div className="bg-white rounded-xl shadow border">
        <NonIdealState
          icon={<CalendarDaysIcon className="h-16 stroke-primary" />}
          title="Prenotazione confermata"
          description="Riceverai una mail ed un SMS di conferma con tutti i dettagli della prenotazione."
        />
      </div>
    </div>
  );
}
