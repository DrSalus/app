import type { ActionFunction, LoaderFunction } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import { handleRequest } from "~/services/doctor.server";

export const action: ActionFunction = async ({ request }) => {
  const redirectTo = await handleRequest(request);
  return redirect(redirectTo ?? "/doctors");
};

export const loader: LoaderFunction = async ({ request }) => {
  return redirect("/doctors");
};
