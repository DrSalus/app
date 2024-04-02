import {
	FaceFrownIcon,
	MapPinIcon,
	PhoneIcon,
	ReceiptPercentIcon,
	UserIcon,
} from "@heroicons/react/24/solid";
import { LoaderFunctionArgs, redirect } from "@remix-run/node";
import { Outlet, useLoaderData } from "@remix-run/react";
import { isEmpty } from "lodash-es";
import { useEffect, useState } from "react";
import { LinkButton } from "~/components/button";
import Logo from "~/components/logo";
import RatingView from "~/components/ratingsView";
import type { SelectOption } from "~/components/select";
import { Select } from "~/components/select";
import Show from "~/components/show";
import { authenticator } from "~/services/auth.server";
import { db } from "~/utils/db.server";
import { getDisplayName, getSpecializations } from "~/utils/patient";
import type { Agenda, Clinic, Doctor, ServiceOffering } from "@prisma/client";
import NonIdealState from "~/components/nonIdealState";
import { UserKind } from "~/utils/enum";

export async function loader({ request, params }: LoaderFunctionArgs) {
	const user = await authenticator.isAuthenticated(request, {});

	if (user != null) {
		let kind = user.kind;

		// In testing, we change the user kind lot of times, so
		// we need to retrieve each time.
		console.log(process.env.FORCE_GET_USER_KIND);
		if (process.env.FORCE_GET_USER_KIND) {
			console.log(
				"[WARNING]: Force get user kind is enabled, please disable in production",
			);
			kind =
				(await db.user.findUnique({ where: { id: user.id } }))?.kind ?? kind;
		}
		console.log(`User ${user.email} is ${kind}`);

		switch (kind) {
			case UserKind.DOCTOR_ASSISTANT:
			case UserKind.DOCTOR:
				return redirect("/agenda");
			case UserKind.ADMIN:
				return redirect("/admin");
			case UserKind.CLINIC_MANAGER:
				return redirect("/manager");
		}
	}

	const services = await db.clinicalService.findMany({});

	return { services };
}

type City = { nome: string; sigla: string };
type AgendaWithData = Agenda & {
	doctor: Doctor;
	clinic: Clinic;
	services: ServiceOffering[];
};

const amountFormatter = new Intl.NumberFormat("it-IT", {
	style: "currency",
	currency: "EUR",
});

export default function Home() {
	const { services } = useLoaderData<typeof loader>();

	const [agendas, setAgendas] = useState<AgendaWithData[]>([]);
	const [service, setService] = useState<SelectOption | null>();
	const [city, setCity] = useState<SelectOption | null>();
	const disabled = city == null || service == null;
	const [citiesOptions, setCitiesOptions] = useState<SelectOption[]>([]);
	useEffect(() => {
		fetch("/comuni.json")
			.then((res) => res.json())
			.then((r) => {
				const cities = r as City[];
				setCitiesOptions(
					cities.map((c) => ({
						value: c.nome,
						label: `${c.nome}, ${c.sigla}`,
					})),
				);
			});
	}, []);

	useEffect(() => {
		fetch("/search", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({ city: city?.value, service: service?.value }),
		})
			.then((res) => res.json())
			.then((res: any) => setAgendas(res?.agendas as AgendaWithData[]));
	}, [city, service]);

	const hasAgendas = !isEmpty(agendas);

	return (
		<div className="h-screen flex flex-col">
			<div className="h-2/5 md:h-1/2 relative px-4 md:px-0 bg-gradient-to-b from-sky-800 to-sky-700 flex flex-col items-center justify-center">
				<img
					src="/hero.jpg"
					alt="A doctor in background"
					className="absolute opacity-10 w-full h-full object-cover overflow-hidden"
				/>
				<div className="z-10 flex flex-col items-center md:items-start w-full max-w-3xl py-2 md:py-4">
					<Logo
						mono
						className="h-16 sm:h-18 md:h-24 self-center mb-4 md:mb-8"
					/>
					<div className="text-center md:text-left font-semibold text-xl md:text-2xl text-white">
						Prenota la tua visita in pochi click!
					</div>
					<div className="text-center md:text-left text-gray-300">
						Trova il tuo medico o laboratorio e prenota la tua prossima visita.
					</div>
				</div>

				<div className="z-10 relative flex flex-col md:flex-row items-stretch gap-x-2 gap-y-2 h-14 shadow-lg  rounded w-full max-w-3xl">
					<div className="flex-grow shadow-xl">
						<Select
							name="service-input"
							className="service-input"
							placeholder="Seleziona una visita o un esame..."
							onChangeValue={(v) => setService(v)}
							options={services.map((s) => ({
								value: s.id,
								label: s.name,
							}))}
						/>
					</div>
					<div className="flex-grow shadow-xl">
						<Select
							name="service-input"
							className="service-input"
							placeholder="Scegli una città..."
							onChangeValue={(v) => setCity(v)}
							options={citiesOptions}
						/>
					</div>
				</div>
			</div>
			<Outlet />
			<Show if={disabled}>
				<div className="flex-grow flex flex-col items-center px-4 py-2 justify-center">
					<div className="text-3xl flex flex-col md:flex-row items-center font-bold text-primary mt-4">
						<div className="pr-3">La tua salute passa da</div>{" "}
						<Logo className="h-10" />
					</div>
					<div className="text-base  text-center text-gray-600 mt-2 max-w-lg">
						Prenota online la tua visita su Dr Salus: semplice, veloce e
						conveniente. Disponibile 24 su 24, 7 giorni su 7. Accedi a pacchetti
						e promozioni esclusive.
					</div>
				</div>
			</Show>
			<Show unless={disabled}>
				<>
					<Show if={hasAgendas}>
						<div className="flex-grow flex flex-nowrap items-stretch overflow-scroll gap-x-4 p-4 max-w-full">
							{agendas.map((agenda) => {
								const amount = agenda.services.find(
									(d) => d.serviceId === service?.value,
								)?.amount;
								return (
									<div
										key={agenda.id}
										className="bg-white relative group rounded-2xl shadow-md border "
									>
										<div className="w-80 flex flex-col items-center py-8 group px-4">
											<UserIcon className="w-16 md:w-20 h-16 md:h-20 bg-primary text-white p-2 rounded-full" />
											<div className="font-medium text-xl mt-3">
												{agenda.doctor != null
													? getDisplayName(agenda.doctor)
													: agenda.clinic.name}
											</div>
											<div className="text-base text-center text-gray-600">
												{getSpecializations(agenda.doctor)}
											</div>
											<Show if={agenda.doctor != null}>
												<RatingView value={agenda.doctor?.rating ?? 0} />
											</Show>
											<div className="flex flex-col items-start self-start mt-6 gap-y-1">
												<div className="flex items-start gap-x-2">
													<MapPinIcon className="h-5 mt-0.5 text-gray-400" />
													<div>
														{agenda.clinic.address} {agenda.clinic.city}
													</div>
												</div>
												<div className="flex items-start gap-x-2">
													<PhoneIcon className="h-4 mt-0.5 text-gray-400" />
													<div>{agenda.clinic.phoneNumber}</div>
												</div>
												<div className="flex items-start gap-x-2">
													<ReceiptPercentIcon className="h-6 mt-0.5 text-gray-400" />
													<div className="flex-grow">{service?.label}</div>
													<div className="font-semibold text-primary">
														{amount != null
															? amountFormatter.format(amount)
															: "-"}
													</div>
												</div>
											</div>
											<a
												href={`/book/${agenda.id}?service=${service?.value}`}
												className="absolute bottom-0 left-0 font-bold text-gray-600 right-0 text-center py-3 rounded-b-xl group-hover:bg-primary group-hover:text-white cursor-pointer border-t"
											>
												PRENOTA
											</a>
										</div>
									</div>
								);
							})}
						</div>
					</Show>
					<Show unless={hasAgendas}>
						<div className="flex flex-col items-center flex-grow ">
							<NonIdealState
								icon={<FaceFrownIcon />}
								title="Nessuna Disponibilità"
								description="Non abbiamo trovato nessuna disponibilità per la prestazione che cerchi vicino a te"
							/>
						</div>
					</Show>
				</>
			</Show>
			<div className="top-2 right-2 fixed opacity-0 md:opacity-100">
				<LinkButton dark={true} to="/login" text="Accedi" minimal />
			</div>
		</div>
	);
}
