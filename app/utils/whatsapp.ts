import { WABAClient, WABAErrorAPI } from "whatsapp-business";

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
								text: "12 Dicembre 2024",
							},
							{
								type: "text",
								text: "09:00",
							},
						],
					},
				],
			},
		});
		console.log(rest);
	} catch (err) {
		console.error(err);
		// throw new Error("Error while sending the booking confirmation")
	}
}
