import { LoaderFunctionArgs, redirect } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { first, times } from "lodash-es";
import { DateTime } from "luxon";
import {
	ValidatedForm,
	useFormContext,
	useIsValid,
} from "remix-validated-form";
import Button from "~/components/button";
import CalendarField from "~/components/fields/calendarField";
import InputField from "~/components/fields/inputField";
import PhoneInputField from "~/components/fields/phoneInputField";
import SelectField from "~/components/fields/selectField";
import { CalendarSlot } from "~/components/simpleCalendar";
import { authenticator } from "~/services/auth.server";
import { getCalendarSlots } from "~/utils/calendar";
import { db } from "~/utils/db.server";
import { validator } from "~/validators/booking";

export async function loader({ request, params }: LoaderFunctionArgs) {
	const lookAhead = 12;
	const user = await authenticator.isAuthenticated(request, {
		failureRedirect: "/login",
	});

	const agenda = await db.agenda.findUnique({
		where: { id: params.agendaId },
		include: {
			clinic: true,
			doctor: true,
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
		lookAhead: 4,
	});

	return { user, agenda, slots };
}

export default function ClinicBooking() {
	const { agenda, slots } = useLoaderData<typeof loader>();
	return (
		<div className="flex flex-col items-center bg-white rounded-lg mx-4 my-1 border shadow-xl">
			<div className="text-3xl text-primary font-bold mt-4">
				{agenda.clinic.name}
			</div>
			<div className="text-base">
				{agenda.clinic.address} {agenda.clinic.city}
			</div>

			<div className="mt-8">
				<ValidatedForm
					method="post"
					className="form-col"
					key={agenda.id}
					validator={validator}
					resetAfterSubmit={true}
					encType="multipart/form-data"
					action="/booking/upsert"
				>
					<CalendarField name="date" slots={slots} />
					<input type="hidden" name="agendaId" value={agenda.id} />
					<input type="hidden" name="clinicId" value={agenda.clinicId} />
					<div className="flex flex-col gap-y-1">
						<InputField name="firstName" label="Nome" />
						<InputField name="lastName" label="Cognome" />
						<PhoneInputField name="phoneNumber" label="Numero di Telefono" />
						<InputField name="emailAddress" label="Indirizzo Email" />
						<SelectField
							name="serviceId"
							label="Servizio"
							options={[
								{
									value: "",
									label: "Seleziona un servizio...",
								},
								...agenda.services.map((service) => ({
									value: service.id,
									label: service.service.name,
								})),
							]}
						/>
					</div>

					<div className="p-4 pb-2">
						<SubmitButton />
					</div>
				</ValidatedForm>
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
