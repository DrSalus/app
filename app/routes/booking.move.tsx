import type { ActionFunction, LoaderFunction } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import { isString } from "lodash-es";
import { handleRequest } from "~/services/booking.move.server";

export const action: ActionFunction = async ({ request }) => {
	const res = await handleRequest(request);
	return isString(res) ? redirect(res) : res;
};

export const loader: LoaderFunction = async ({ request }) => {
	return redirect("/");
};
