import { LoaderFunctionArgs, json } from "@remix-run/node";
import { authenticator } from "~/services/auth.server";
import { db } from "~/utils/db.server";

export async function loader({ request, params }: LoaderFunctionArgs) {
	const user = await authenticator.isAuthenticated(request, {
		failureRedirect: "/login",
	});

	const booking = await db.serviceBooking.findUnique({
		where: {
			id: params.id,
		},
	});
	return json({ booking });
}
