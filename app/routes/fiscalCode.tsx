import { LoaderFunctionArgs } from "@remix-run/node";
import { DateTime } from "luxon";
import { sendBookingReminder } from "~/services/remind";
import { db } from "~/utils/db.server";

export async function loader({ request, params }: LoaderFunctionArgs) {
	const url = new URL(request.url);
	const query = url.searchParams.get("query") ?? "";
	const id = url.searchParams.get("id") ?? "";

	const number = await db.patient.count({
		where: { fiscalCode: query, id: { not: id } },
	});

	return { result: number > 0 };
}
