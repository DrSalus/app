import { authenticator } from "~/services/auth.server";
import { json, type LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { DateTime } from "luxon";
import { LinkButton } from "~/components/button";
import {
  ArrowRightOnRectangleIcon,
  BuildingOfficeIcon,
  ReceiptPercentIcon,
  UserCircleIcon,
  UserGroupIcon,
  WrenchIcon,
} from "@heroicons/react/24/solid";
import HomeItem from "~/components/homeItem";
import { DocumentArrowUpIcon } from "@heroicons/react/24/outline";

export async function loader({ request }: LoaderFunctionArgs) {
  // If the user is already authenticated redirect to /dashboard directly
  const user = await authenticator.isAuthenticated(request, {
    failureRedirect: "/login",
  });

  return json({ user });
}

export default function Dashboard() {
  const { user } = useLoaderData<typeof loader>();

  return (
    <div className="flex flex-col">
      <div className="-mt-3 header flex px-4">
        <div className="flex flex-col items-center gap-x-2">
          <UserCircleIcon className="h-24 text-gray-400" />
          {/* <img src={workspace?.logo} className="h-24" /> */}
          <h4 className="text-sky-700 text-2xl">
            {user.firstName} {user.lastName}
          </h4>
          <div className="text-gray-800">{user.email}</div>
          <div className="text-gray-500 text-sm">
            Iscritto il{" "}
            {DateTime.fromISO(user.createdAt, {
              zone: "Europe/Rome",
              setZone: true,
            }).toLocaleString(DateTime.DATE_MED)}
          </div>
          <LinkButton
            className="mt-2"
            intent="danger"
            to="/logout"
            text="Logout"
            small={true}
            icon={<ArrowRightOnRectangleIcon />}
          />
        </div>
      </div>
      <div className="grid grid-cols-5 gap-4 p-4">
        <HomeItem
          icon={<UserGroupIcon />}
          to="/patients"
          title="Gestione Pazienti"
        />
        <HomeItem
          icon={<BuildingOfficeIcon />}
          to="/clinics"
          title="Gestione Cliniche"
        />
        <HomeItem
          icon={<ReceiptPercentIcon />}
          to="/clinicalServices"
          title="Gestione Prestazioni"
        />
        <HomeItem
          icon={<DocumentArrowUpIcon />}
          to="/doctors"
          title="Gestione Dottori"
        />
        <HomeItem icon={<WrenchIcon />} to="/admin" title="Admin" />
      </div>
    </div>
  );
}
