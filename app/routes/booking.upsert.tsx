import type { ActionFunction, LoaderFunction } from "@remix-run/node";
import { redirect } from "@remix-run/node";

export const action: ActionFunction = async ({ request }) => {
  console.log("Got");
  return redirect("/");
};

export const loader: LoaderFunction = async ({ request }) => {
  return redirect("/");
};
