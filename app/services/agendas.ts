import { parseMultipartFormData } from "~/utils/utils.server";
import { validator } from "~/validators/agenda";
import { validationError } from "remix-validated-form";
import { db } from "~/utils/db.server";
import { isEmpty } from "lodash-es";

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
				...other
			} = data;
			await db.agenda.update({
				where: { id: _id },
				data: {
					...other,
					validFrom: new Date(other.validFrom),
					validUntil: !isEmpty(other.validUntil)
						? new Date(other.validUntil)
						: undefined,
					doctorId: doctorId != null ? doctorId : undefined,
					services: {
						set: services ?? [],
					},
				},
			});
			break;
		}

		case "create": {
			const { _action, _redirect, doctorId, services, ...other } = data;
			await db.agenda.create({
				data: {
					...other,
					validFrom: new Date(other.validFrom),
					validUntil: !isEmpty(other.validUntil)
						? new Date(other.validUntil)
						: undefined,
					doctorId: doctorId != null ? doctorId : undefined,
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
