import { parseMultipartFormData } from "~/utils/utils.server";
import { authenticator } from "./auth.server";
import { clinicKeys, validator } from "~/validators/clinic";
import { validationError } from "remix-validated-form";
import { db } from "~/utils/db.server";
import { pickBy } from "lodash-es";
import { Clinic } from "@prisma/client";
import { geocode } from "~/utils/geocode";

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
			const clinic = await db.clinic.update({
				where: {
					id: _id,
				},
				data: other,
			});
			await fillGeocodeInfo(clinic);
			break;
		}

		case "create": {
			const { _action, _redirect, ...other } = data;
			const clinic = await db.clinic.create({
				data: other,
			});
			await fillGeocodeInfo(clinic);
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

async function fillGeocodeInfo(clinic: Clinic) {
	const result = await geocode(
		`${clinic.address} ${clinic.city} ${clinic.province} ${clinic.postalCode}}`,
	);
	if (result.length > 0) {
		await db.clinic.update({
			where: { id: clinic.id },
			data: {
				latitude: result[0].latitude,
				longitude: result[0].longitude,
			},
		});
	}
}
