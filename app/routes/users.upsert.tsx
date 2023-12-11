import type { ActionFunction, LoaderFunction } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import { handleRequest } from "~/services/users.server";

export const action: ActionFunction = async ({ request }) => {
	const redirectTo = await handleRequest(request);
	return redirect(redirectTo ?? "/users");
};

export const loader: LoaderFunction = async ({ request }) => {
	return redirect("/users");
};
