// Finally, we can export a loader function where we check if the user is
// authenticated with `authenticator.isAuthenticated` and redirect to the

import { useEffect } from "react";
import { useLoaderData, useNavigate } from "@remix-run/react";
import type { LoaderFunction } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import { authenticator } from "~/services/auth.server";
import { destroySession, getSession } from "~/services/session.server";

// dashboard if it is or return null if it's not
export let loader: LoaderFunction = async ({ request }) => {
  // If the user is already authenticated redirect to /dashboard directly
  await authenticator.isAuthenticated(request, {
    failureRedirect: "/login",
  });

  return redirect("/login", {
    headers: {
      "Set-Cookie": await destroySession(await getSession(request)),
    },
  });
};

export default function Screen() {
  return <div />;
}
