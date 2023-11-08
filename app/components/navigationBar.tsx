import type { User } from "@prisma/client";
import React from "react";
import { Link, useLoaderData } from "@remix-run/react";
import IfAdmin from "./admin";
import Logo from "./logo";
import { LinkButton } from "./button";
import { ArrowRightOnRectangleIcon } from "@heroicons/react/24/solid";

export default function NavigationBar() {
  const data = useLoaderData<{ user?: User }>();
  console.log("=>", data);

  return data?.user != null ? (
    <div className="navigation-bar print:hiddeny">
      <Logo mono={true} />
      <Link to="/dashboard">
        <h1>Home</h1>
      </Link>
      <div className="navigation-bar-items">
        <IfAdmin>
          <>
            <Link to="/company">
              <span>Aziende</span>
            </Link>
          </>
        </IfAdmin>
      </div>
      <div className="navigation-bar-right">
        {data.user.firstName} {data.user.lastName}
      </div>
      <LinkButton
        className="ml-2 text-white"
        to="/logout"
        minimal={true}
        small={true}
        icon={<ArrowRightOnRectangleIcon />}
      />
    </div>
  ) : (
    <React.Fragment />
  );
}
