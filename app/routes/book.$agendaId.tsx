import { LoaderFunctionArgs, redirect } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { ValidatedForm, useFormContext } from "remix-validated-form";
import BookingDetail from "~/components/bookings/bookingDetail";
import BookingHeader from "~/components/bookings/bookingHeader";
import Button from "~/components/button";
import { authenticator } from "~/services/auth.server";
import { getCalendarSlots } from "~/utils/calendar";
import { db } from "~/utils/db.server";
import { ClientOnly } from "remix-utils/client-only";
import { getDisplayName, getSpecializations } from "~/utils/patient";
import { validator } from "~/validators/booking";
import BookingCalendar from "~/components/bookings/bookingCalendar";
import BookingInputs from "~/components/bookings/bookingInputs";
import { ShowIfDate } from "~/components/bookings/showIfDate";

export const links: LinksFunction = () => [
	{
		rel: "stylesheet",
		href: "https://unpkg.com/leaflet@1.8.0/dist/leaflet.css",
	},
];
export async function loader({ request, params }: LoaderFunctionArgs) {
	const user = await authenticator.isAuthenticated(request, {
		failureRedirect: "/login",
	});

	const agenda = await db.agenda.findUnique({
		where: { id: params.agendaId },
		include: {
			clinic: true,
			doctor: {
				include: {
					specialities: true,
				},
			},
			services: {
				include: {
					service: true,
				},
			},
		},
	});
	if (agenda == null) {
		return redirect("/dashboard");
	}

	const slots = await getCalendarSlots(agenda, {
		lookAhead: 20,
		ignoreEmptyDays: true,
	});

	return { user, agenda, slots };
}

export default function ClinicBooking() {
	const { agenda, slots } = useLoaderData<typeof loader>();
	return (
		<div className="flex flex-col items-center ">
			<div className="grid grid-cols-12">
				<div className="col-start-3 col-span-4 flex flex-col items-stretch bg-white rounded-lg mx-4 border shadow-xl">
					<BookingHeader
						className="py-4 px-2 bg-gray-50 rounded-t-lg overflow-hidden self-stretch"
						type={agenda.doctor ? "doctor" : "clinic"}
						title={
							agenda.doctor ? getDisplayName(agenda.doctor) : agenda.clinic.name
						}
						subtitle={
							agenda.doctor
								? getSpecializations(agenda.doctor)
								: agenda.clinic.address
						}
					/>
					<ValidatedForm
						method="post"
						className="form-col items-stretch"
						key={agenda.id}
						validator={validator}
						resetAfterSubmit={true}
						encType="multipart/form-data"
						action="/booking/upsert"
					>
						<BookingCalendar className="pt-4 pb-8 self-center" slots={slots} />
						<input type="hidden" name="agendaId" value={agenda.id} />
						<input type="hidden" name="clinicId" value={agenda.clinicId} />

						<BookingInputs
							services={agenda.services.map((service) => ({
								value: service.id,
								label: service.service.name,
							}))}
						/>

						<ShowIfDate>
							<div className="pb-2 self-stretch px-4 mt-4">
								<SubmitButton />
							</div>
						</ShowIfDate>
					</ValidatedForm>
				</div>
				<div className="col-span-4 col-start-7">
					<ClientOnly>
						{() => <BookingDetail className="mt-2" clinic={agenda.clinic} />}
					</ClientOnly>
				</div>
			</div>
		</div>
	);
}

function SubmitButton() {
	const { isValid, fieldErrors, getValues } = useFormContext();
	console.log(fieldErrors);
	console.log(getValues().get("phoneNumber"));
	return (
		<Button
			intent="primary"
			className="w-full"
			disabled={!isValid}
			type="submit"
			text={"Prenota"}
		/>
	);
}
