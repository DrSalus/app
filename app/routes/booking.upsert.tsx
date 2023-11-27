import type { ActionFunction, LoaderFunction } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import { handleRequest } from "~/services/booking.server";

export const action: ActionFunction = async ({ request }) => {
	const redirectTo = await handleRequest(request);
	return redirect("/");
};

export const loader: LoaderFunction = async ({ request }) => {
	return redirect("/");
};
