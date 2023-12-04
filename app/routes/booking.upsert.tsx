import type { ActionFunction, LoaderFunction } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import { isString } from "lodash-es";
import { handleRequest } from "~/services/booking.server";

export const action: ActionFunction = async ({ request }) => {
  const redirectTo = await handleRequest(request);
  return isString(redirectTo) ? redirect(redirectTo) : redirectTo;
};

export const loader: LoaderFunction = async ({ request }) => {
  return redirect("/");
};
