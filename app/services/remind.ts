import { MessageKind } from "@prisma/client";
import { db } from "~/utils/db.server";
import { sendWhatsAppMessage } from "~/utils/whatsapp";

export async function sendBookingReminder(bookingId: string) {
	const booking = await db.serviceBooking.findUnique({
		where: { id: bookingId },
		include: {
			patient: true,
			service: {
				include: {
					service: {
						select: {
							name: true,
						},
					},
				},
			},
			agenda: {
				include: {
					clinic: true,
				},
			},
		},
	});

	if (booking == null || booking.patient.phoneNumber == null) {
		return false;
	}

	// Send the booking confirmation.
	const result = await sendWhatsAppMessage(
		{
			address: `${booking.agenda.clinic.address}, ${booking.agenda.clinic.city}`,
			bookedAt: booking.bookedAt.toISOString(),
			clinic: booking.agenda.clinic.name,
			bookingId: booking.id,
			name: [booking.patient.firstName, booking.patient.lastName].join(" "),
			recipient: booking.patient.phoneNumber,
			service: booking.service.service.name,
		},
		MessageKind.REMIND_24H,
	)
		.then((res) => {
			console.log(res);
			return true;
		})
		.catch((err) => {
			console.error(err);
			return false;
		});
}
