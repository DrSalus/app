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
import SelectField from "~/components/fields/selectField";
import { CalendarSlot } from "~/components/simpleCalendar";
import { authenticator } from "~/services/auth.server";
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

  const slots: CalendarSlot[] = times(lookAhead).map((index) => {
    const date = DateTime.now().plus({ days: index });
    return {
      date: date.toISODate()!,
      slots: times(10).map((index) => ({
        time: date
          .startOf("day")
          .plus({ hours: 8, minutes: agenda.slotInterval * index })
          .toISO()!,
        available: true,
      })),
    };
  });
  console.log(JSON.stringify(slots, null, "\t"));

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
          key={agenda.id}
          validator={validator}
          resetAfterSubmit={true}
          action="/booking/upsert"
        >
          <CalendarField name="date" slots={slots} />
          <input type="hidden" name="agendaId" value={agenda.id} />
          <input type="hidden" name="clinicId" value={agenda.clinicId} />
          <div className="flex flex-col gap-y-1">
            <InputField name="firstName" label="Nome" />
            <InputField name="lastName" label="Cognome" />
            <SelectField
              name="serviceId"
              label="Servizio"
              defaultValue={first(agenda.services)?.serviceId}
              options={agenda.services.map((service) => ({
                value: service.serviceId,
                label: service.service.name,
              }))}
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
  const { isValid, fieldErrors } = useFormContext();
  console.log(fieldErrors);
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
