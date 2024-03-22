import { WABAClient, WABAErrorAPI } from "whatsapp-business";
import { db } from "./db.server";
import { MessageKind } from "@prisma/client";
import { DateTime } from "luxon";

//You cant get it from the meta for developers app administration
const client = new WABAClient({
	accountId: process.env.WHATSAPP_ACCOUNT_ID!,
	apiToken: process.env.WHATSAPP_API_TOKEN!,
	phoneId: process.env.WHATSAPP_PHONE_ID!,
});

interface BookingConfirmation {
	recipient: string;
	name: string;
	service: string;
	clinic: string;
	address: string;
	bookedAt: string;
	bookingId: string;
}

export async function sendBookingConfirmation(
	confirmation: BookingConfirmation,
) {
	try {
		const rest = await client.sendMessage({
			to: confirmation.recipient,
			type: "template",
			template: {
				name: process.env.WHATSAPP_BOOKING_CONFIRMATION_TEMPLATE_ID!,
				language: {
					code: "it",
					policy: "deterministic",
				},
				components: [
					{
						type: "body",
						parameters: [
							{
								type: "text",
								text: confirmation.name,
							},
							{
								type: "text",
								text: confirmation.service,
							},
							{
								type: "text",
								text: confirmation.clinic,
							},
							{
								type: "text",
								text: confirmation.address,
							},
							{
								type: "text",
								text: DateTime.fromISO(confirmation.bookedAt).toLocaleString(
									DateTime.DATE_MED,
								),
							},
							{
								type: "text",
								text: DateTime.fromISO(confirmation.bookedAt).toLocaleString(
									DateTime.TIME_24_SIMPLE,
								),
							},
						],
					},
				],
			},
		});
		console.log(rest);

		// Create the message sent.
		await db.message.create({
			data: {
				kind: MessageKind.BOOKING_CONFIRMATION,
				recipient: confirmation.recipient,
				bookingId: confirmation.bookingId,
			},
		});
	} catch (err: any) {
		console.error(err);
		// throw new Error("Error while sending the booking confirmation")

		// Create the message sent.
		await db.message.create({
			data: {
				kind: MessageKind.BOOKING_CONFIRMATION,
				recipient: confirmation.recipient,
				bookingId: confirmation.bookingId,
				errorCode: err.code,
				errorMessage: err.message,
			},
		});
	}
}

const templateByKind = {
	[MessageKind.BOOKING_CONFIRMATION]:
		process.env.WHATSAPP_BOOKING_CONFIRMATION_TEMPLATE_ID!,
	[MessageKind.REMIND_24H]:
		process.env.WHATSAPP_BOOKING_REMINDER_24H_TEMPLATE_ID!,
};

export async function sendWhatsAppMessage(
	confirmation: BookingConfirmation,
	kind: MessageKind,
) {
	try {
		const rest = await client.sendMessage({
			to: confirmation.recipient,
			type: "template",
			template: {
				name: templateByKind[kind],
				language: {
					code: "it",
					policy: "deterministic",
				},
				components: [
					{
						type: "body",
						parameters: [
							{
								type: "text",
								text: confirmation.name,
							},
							{
								type: "text",
								text: confirmation.service,
							},
							{
								type: "text",
								text: confirmation.clinic,
							},
							{
								type: "text",
								text: confirmation.address,
							},
							{
								type: "text",
								text: DateTime.fromISO(confirmation.bookedAt).toLocaleString(
									DateTime.DATE_MED,
									{ locale: "it" },
								),
							},
							{
								type: "text",
								text: DateTime.fromISO(confirmation.bookedAt).toLocaleString(
									DateTime.TIME_24_SIMPLE,
									{ locale: "it" },
								),
							},
						],
					},
				],
			},
		});
		console.log(rest);

		// Create the message sent.
		await db.message.create({
			data: {
				kind,
				recipient: confirmation.recipient,
				bookingId: confirmation.bookingId,
			},
		});
	} catch (err: any) {
		console.error(err);
		// throw new Error("Error while sending the booking confirmation")

		// Create the message sent.
		await db.message.create({
			data: {
				kind,
				recipient: confirmation.recipient,
				bookingId: confirmation.bookingId,
				errorCode: err.code,
				errorMessage: err.message,
			},
		});
	}
}
