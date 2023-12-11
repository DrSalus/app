import { hashPassword, parseMultipartFormData } from "~/utils/utils.server";
import { validator } from "~/validators/user";
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
		case "create": {
			const { _action, _redirect, passwordConfirmation, password, ...user } =
				data;
			const hashedPassword = await hashPassword(password);

			await db.user.create({
				data: {
					...user,
					password: hashedPassword,
				},
			});
			break;
		}
		case "update": {
			const { _action, _redirect, _id, ...user } = data;

			await db.user.update({
				where: {
					id: _id,
				},
				data: {
					...user,
				},
			});
			break;
		}
	}

	return _redirect;
}
