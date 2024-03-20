import { parseMultipartFormData } from "~/utils/utils.server";
import type { Agenda } from "~/validators/agenda";
import { validator } from "~/validators/agenda";
import { validationError } from "remix-validated-form";
import { db } from "~/utils/db.server";
import { isEmpty, isNil, defaults, omitBy } from "lodash-es";
import { DateTime } from "luxon";
import { getCalendarSlots } from "~/utils/calendar";
import { authenticator } from "./auth.server";
import { LoaderFunctionArgs, SerializeFrom } from "@remix-run/node";

async function applyPlanData(
	agendaId: string,
	data: Pick<Agenda, "mon" | "tue" | "wed" | "thu" | "fri" | "sat" | "sun">,
) {
	const planData = defaults(
		{
			...data,
			agendaId: agendaId,
		},
		{ mon: [], tue: [], wed: [], thu: [], fri: [], sat: [], sun: [] },
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
				users,
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
			let usersToSet;

			if (_source === "agenda") {
				doctor = null;
				serviceToSet = null;
				usersToSet = null;
			} else {
				doctor =
					doctorId != null
						? { connect: { id: doctorId } }
						: { disconnect: true };
				serviceToSet = {
					set: services ?? [],
				};
				usersToSet = {
					set: users ?? [],
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
						users: usersToSet,
					},
					isNil,
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
				users,
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
					users: {
						connect: users ?? [],
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

export async function loader({ request, params }: LoaderFunctionArgs) {
	const user = await authenticator.isAuthenticated(request, {
		failureRedirect: "/login",
	});
	const url = new URL(request.url);
	const queryDate = url.searchParams.get("date");
	const slot = url.searchParams.get("slot");
	const agenda = await db.agenda.findUnique({
		where: {
			id: params.agendaId,
		},
		include: {
			doctor: true,
			plans: true,
			clinic: {
				select: {
					name: true,
				},
			},
			users: {
				select: {
					id: true,
					firstName: true,
					lastName: true,
				},
			},
			services: {
				include: {
					service: {
						select: {
							name: true,
						},
					},
				},
			},
		},
	});

	if (agenda == null) {
		throw new Error("Agenda not found");
	}

	const date = queryDate != null ? DateTime.fromISO(queryDate) : DateTime.now();
	const slots = await getCalendarSlots(agenda, {
		lookAhead: 1,
		date,
		includeBookings: true,
	});
	const bookingId =
		slot != null
			? slots[0].slots.find((d) => d.time === slot)?.booking?.id
			: null;

	const booking =
		bookingId != null
			? await db.serviceBooking.findUnique({
					where: { id: bookingId },
					include: {
						patient: true,
						service: {
							include: {
								service: true,
								doctor: true,
							},
						},
					},
			  })
			: null;

	return { user, agenda, slots, booking, date: date.toISODate() };
}

export type Response = SerializeFrom<typeof loader>;
export type AgendaBooking = Response["booking"];
