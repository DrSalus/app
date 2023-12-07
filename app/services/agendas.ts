import { parseMultipartFormData } from "~/utils/utils.server";
import { Agenda, validator } from "~/validators/agenda";
import { validationError } from "remix-validated-form";
import { db } from "~/utils/db.server";
import { isEmpty } from "lodash-es";

async function applyPlanData(
  agendaId: string,
  data: Pick<Agenda, "mon" | "tue" | "wed" | "thu" | "fri" | "sat" | "sun">
) {
  const planData = {
    ...data,
    agendaId: agendaId,
  };

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
      const doctor =
        doctorId != null ? { connect: { id: doctorId } } : { disconnect: true };

      applyPlanData(_id as string, { mon, tue, wed, thu, fri, sat, sun });
      await db.agenda.update({
        where: { id: _id },
        data: {
          ...other,
          validFrom: new Date(other.validFrom),
          validUntil: !isEmpty(other.validUntil)
            ? new Date(other.validUntil)
            : undefined,
          doctor,
          services: {
            set: services ?? [],
          },
        },
      });
      break;
    }

    case "create": {
      const {
        _action,
        _redirect,
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
