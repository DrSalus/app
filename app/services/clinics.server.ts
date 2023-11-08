import { parseMultipartFormData } from "~/utils/utils.server";
import { authenticator } from "./auth.server";
import { clinicKeys, validator } from "~/validators/clinic";
import { validationError } from "remix-validated-form";
import { db } from "~/utils/db.server";
import { pickBy } from "lodash-es";
import { Clinic } from "@prisma/client";

export async function handleRequest(request: Request) {
  const form = await parseMultipartFormData(request);

  const user = await authenticator.isAuthenticated(request, {
    failureRedirect: "/login",
  });

  // Validate
  const result = await validator.validate(form);
  if (result.error) {
    return validationError(result.error);
  }

  const { data } = result;
  const { _redirect } = data;
  switch (data._action) {
    case "update": {
      const { _action, _redirect, _id, ...other } = data;
      await db.clinic.update({
        where: {
          id: _id,
        },
        data: other,
      });
      break;
    }

    case "create": {
      const { _action, _redirect, ...other } = data;
      await db.clinic.create({
        data: other,
      });
      break;
    }

    case "delete": {
      const { _id } = data;
      await db.clinic.delete({
        where: {
          id: _id,
        },
      });
      break;
    }
  }

  return _redirect;
}
