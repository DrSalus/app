import { parseMultipartFormData } from "~/utils/utils.server";
import type { Agenda } from "~/validators/agenda";
import { validator } from "~/validators/agenda";
import { validationError } from "remix-validated-form";
import { db } from "~/utils/db.server";
import { isEmpty, isNil, defaults, omitBy } from "lodash-es";

async function applyPlanData(
  agendaId: string,
  data: Pick<Agenda, "mon" | "tue" | "wed" | "thu" | "fri" | "sat" | "sun">
) {
  const planData = defaults(
    {
      ...data,
      agendaId: agendaId,
    },
    { mon: [], tue: [], wed: [], thu: [], fri: [], sat: [], sun: [] }
  );
  console.log(planData);

  const agendaPlan = await db.agendaPlan.findFirst({
    where: { agendaId },
  });

  if (agendaPlan == null) {
    await db.agendaPlan.create({ data: planData });
  } else {
    await db.agendaPlan.update({
      where: { id: agendaPlan.id },
      data: planData,
    });
  }
}

export async function handleRequest(request: Request) {
  const form = await parseMultipartFormData(request);

  // Validate
  const result = await validator.validate(form);
  if (result.error) {
    return validationError(result.error);
  }

  const { data } = result;
  const { _redirect } = data;
  switch (data._action) {
    case "update": {
      const {
        _action,
        _redirect,
        _source,
        _id,

        services,
        doctorId,
        clinicId,
        mon,
        tue,
        wed,
        thu,
        fri,
        sat,
        sun,
        ...other
      } = data;

      let doctor;
      let serviceToSet;

      if (_source === "agenda") {
        doctor = null;
        serviceToSet = null;
      } else {
        doctor =
          doctorId != null
            ? { connect: { id: doctorId } }
            : { disconnect: true };
        serviceToSet = {
          set: services ?? [],
        };
      }

      applyPlanData(_id as string, { mon, tue, wed, thu, fri, sat, sun });
      await db.agenda.update({
        where: { id: _id },
        data: omitBy(
          {
            ...other,
            validFrom: new Date(other.validFrom),
            validUntil: !isEmpty(other.validUntil)
              ? new Date(other.validUntil)
              : undefined,
            doctor,
            services: serviceToSet,
          },
          isNil
        ),
      });
      break;
    }

    case "create": {
      const {
        _action,
        _redirect,
        _source,
        doctorId,
        clinicId,
        services,
        mon,
        tue,
        wed,
        thu,
        fri,
        sat,
        sun,
        ...other
      } = data;
      const doctor =
        doctorId != null ? { connect: { id: doctorId } } : { disconnect: true };

      await db.agenda.create({
        data: {
          ...other,
          validFrom: new Date(other.validFrom),
          validUntil: !isEmpty(other.validUntil)
            ? new Date(other.validUntil!)
            : undefined,
          doctor,
          clinic: {
            connect: { id: clinicId },
          },
          plans: {
            create: { mon, tue, wed, thu, fri, sat, sun },
          },
          services: {
            connect: services ?? [],
          },
        },
      });
      break;
    }

    case "delete": {
      const { _id } = data;
      await db.agenda.delete({
        where: {
          id: _id,
        },
      });
      break;
    }
  }

  return _redirect;
}
