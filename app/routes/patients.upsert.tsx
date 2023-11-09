import type { ActionFunction, LoaderFunction } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import { handleRequest } from "~/services/patient.server";

export const action: ActionFunction = async ({ request }) => {
  const redirectTo = await handleRequest(request);
  return redirect(redirectTo ?? "/patients");
};

export const loader: LoaderFunction = async ({ request }) => {
  return redirect("/patients");
};
