import { MessageKind } from "@prisma/client";
import { LoaderFunctionArgs, redirect } from "@remix-run/node";
import { sendBookingReminder } from "~/services/remind";
import { getSession } from "~/services/session.server";
import { db } from "~/utils/db.server";
import { sendBookingConfirmation, sendWhatsAppMessage } from "~/utils/whatsapp";

export async function loader({ request, params }: LoaderFunctionArgs) {
	// Send the booking confirmation.
	const result = await sendBookingReminder(params.id!);

	return { result };
}
