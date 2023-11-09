import { parseMultipartFormData } from "~/utils/utils.server";
import { authenticator } from "./auth.server";
import { validator } from "~/validators/patient";
import { validationError } from "remix-validated-form";
import { db } from "~/utils/db.server";

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
      const { _action, _redirect, _id, ...other } = data;
      await db.patient.update({
        where: {
          id: _id,
        },
        data: other,
      });
      break;
    }

    case "create": {
      const { _action, _redirect, ...other } = data;
      await db.patient.create({
        data: other,
      });
      break;
    }

    case "delete": {
      const { _id } = data;
      await db.patient.delete({
        where: {
          id: _id,
        },
      });
      break;
    }
  }

  return _redirect;
}

