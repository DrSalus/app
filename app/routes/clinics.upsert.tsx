import type { ActionFunction, LoaderFunction } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import { handleRequest } from "~/services/clinics.server";

export const action: ActionFunction = async ({ request }) => {
  const redirectTo = await handleRequest(request);
  return redirect(redirectTo ?? "/clinics");
};

export const loader: LoaderFunction = async ({ request }) => {
  return redirect("/clinics");
};
