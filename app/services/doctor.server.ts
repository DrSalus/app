import { parseMultipartFormData } from "~/utils/utils.server";
import { validator } from "~/validators/doctor";
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
			const { _action, _redirect, _id, worksAt, specialities, ...other } = data;
			await db.doctor.update({
				where: {
					id: _id,
				},
				data: {
					...other,
					specialities: {
						connect: specialities,
					},
				},
			});
			break;
		}

		case "create": {
			const { _action, _redirect, worksAt, specialities, ...other } = data;
			await db.doctor.create({
				data: {
					...other,
					specialities: {
						connect: specialities,
					},
					worksAt: !isEmpty(worksAt)
						? {
								connect: {
									id: worksAt,
								},
						  }
						: undefined,
				},
			});
			break;
		}

		case "delete": {
			const { _id } = data;
			await db.doctor.delete({
				where: {
					id: _id,
				},
			});
			break;
		}
	}

	return _redirect;
}
