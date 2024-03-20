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
import Background from "~/components/background";
import Logo from "~/components/logo";

export const links: LinksFunction = () => [
	{
		rel: "stylesheet",
		href: "https://unpkg.com/leaflet@1.8.0/dist/leaflet.css",
	},
];
export async function loader({ request, params }: LoaderFunctionArgs) {
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
		return redirect("/");
	}

	const slots = await getCalendarSlots(agenda, {
		lookAhead: 20,
		ignoreEmptyDays: true,
	});

	return { agenda, slots };
}

export default function ClinicBooking() {
	const { agenda, slots } = useLoaderData<typeof loader>();
	return (
		<Background className="flex flex-col justify-stretch items-center relative px-4">
			<Logo className="h-20 md:h-24 mt-4" mono={true} />
			<div className="my-8 flex flex-col-reverse md:flex-row md:w-full lg:w-4/5 max-w-5xl gap-x-8  items-start z-20">
				<div className="w-full  md:w-1/2 flex-shrink-0 flex flex-grow flex-col items-stretch bg-white rounded-none md:rounded-lg border shadow-xl">
					<BookingHeader
						className="py-4 px-2 bg-gray-50 rounded-t-lg overflow-hidden self-stretch"
						type={agenda.doctor ? "doctor" : "clinic"}
						rating={agenda.doctor?.rating}
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
								serviceId: service.serviceId,
							}))}
						/>

						<ShowIfDate>
							<div className="pb-2 self-stretch mt-6 px-4 mb-2 border-t py-4">
								<SubmitButton />
							</div>
						</ShowIfDate>
					</ValidatedForm>
				</div>
				<div className="flex-grow w-full md:w-1/2 flex items-start justify-center relative bg-white rounded-none md:rounded-lg md:border md:shadow-xl overflow-hidden">
					<ClientOnly>
						{() => <BookingDetail clinic={agenda.clinic} />}
					</ClientOnly>
				</div>
			</div>
		</Background>
	);
}

function SubmitButton() {
	const { isValid, getValues } = useFormContext();
	return (
		<>
			<Button
				intent="primary"
				className="w-full"
				disabled={!isValid}
				type="submit"
				text={"Prenota"}
			/>
		</>
	);
}
