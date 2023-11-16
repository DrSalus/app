import type { ActionFunction, LoaderFunction } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import { handleRequest } from "~/services/clinicPlan.service";

export const action: ActionFunction = async ({ request }) => {
  const redirectTo = await handleRequest(request);
  return redirect(redirectTo ?? "/dashboard");
};

export const loader: LoaderFunction = async ({ request }) => {
  return redirect("/dashboard");
};
