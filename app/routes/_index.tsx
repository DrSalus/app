import {
	ChevronRightIcon,
	MapIcon,
	MapPinIcon,
	PhoneIcon,
	ReceiptPercentIcon,
	UserIcon,
} from "@heroicons/react/24/solid";
import { LoaderFunctionArgs, redirect } from "@remix-run/node";
import { Outlet, useLoaderData } from "@remix-run/react";
import { isEmpty } from "lodash-es";
import { useEffect, useState } from "react";
import Button, { LinkButton } from "~/components/button";
import Logo from "~/components/logo";
import RatingView from "~/components/ratingsView";
import { Select, SelectOption } from "~/components/select";
import Show from "~/components/show";
import { AgendaWithPlans } from "~/dialogs/agenda";
import { authenticator } from "~/services/auth.server";
import { getCalendarSlots } from "~/utils/calendar";
import { db } from "~/utils/db.server";
import { getDisplayName, getSpecializations } from "~/utils/patient";

export async function loader({ request, params }: LoaderFunctionArgs) {
	const user = await authenticator.isAuthenticated(request, {});

	if (user != null) {
		return redirect("/dashboard");
	}

	const services = await db.clinicalService.findMany({});
	const agendas = await db.agenda.findMany({
		include: {
			doctor: {
				include: {
					specialities: true,
				},
			},
			clinic: true,
		},
	});

	return { services, agendas };
}

type City = { nome: string; sigla: string };

export default function Home() {
	const { services, agendas } = useLoaderData<typeof loader>();

	const [service, setService] = useState<string | null>();
	const [city, setCity] = useState<string | null>();
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

	return (
		<div className="h-screen flex flex-col">
			<div className="h-1/3 md:h-1/2  relative px-4 md:px-0 bg-gradient-to-b from-sky-800 to-sky-700 flex flex-col items-center justify-center">
				<img
					src="/hero.jpg"
					alt="A doctor in background"
					className="absolute opacity-10 w-full h-full object-cover overflow-hidden"
				/>
				<div className="z-10 flex flex-col items-start w-full max-w-3xl py-4">
					<div className="font-semibold text-2xl text-white">
						Prenota la tua visita in pochi click!
					</div>
					<div className="text-gray-300">
						Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
						eiusmod tempor incididunt.
					</div>
				</div>

				<div className="z-10 relative flex flex-col md:flex-row items-stretch gap-x-2 gap-y-2 h-14 shadow-lg  rounded w-full max-w-3xl">
					<div className="flex-grow shadow-xl">
						<Select
							name="service-input"
							className="service-input"
							placeholder="Seleziona una visita o un esame..."
							onChangeValue={(v) => setService(v?.value)}
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
							onChangeValue={(v) => setCity(v?.value)}
							options={citiesOptions}
						/>
					</div>
					{/* <Button
            intent={disabled ? "none" : "primary"}
            className="shadow-xl"
            disabled={disabled}
            rightIcon={<ChevronRightIcon />}
            text="Avanti"
          /> */}
				</div>
			</div>
			<Outlet />
			<Show if={disabled}>
				<div className="h-2/3 md:h-1/2 flex flex-col items-center px-4 py-2 justify-center">
					<div className="text-3xl flex flex-col md:flex-row items-center font-bold text-primary mt-4">
						<div>La tua salute passa da</div> <Logo className="h-10" />
					</div>
					<div className="text-base  text-center text-gray-600 mt-2 max-w-lg">
						Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
						eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim
						ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut
						aliquip ex ea commodo consequat
					</div>
				</div>
			</Show>
			<Show unless={disabled}>
				<div className="h-2/3 md:h-1/2 flex flex-nowrap items-stretch overflow-scroll gap-x-4 p-4 max-w-full">
					{agendas.map((agenda) => (
						<div
							key={agenda.id}
							className="bg-white relative group rounded-2xl shadow-md border "
						>
							<div className="w-80 flex flex-col items-center py-8 group">
								<UserIcon className="w-20 h-2w-20 bg-primary text-white p-2 rounded-full" />
								<div className="font-medium text-xl mt-3">
									{agenda.doctor != null
										? getDisplayName(agenda.doctor)
										: agenda.clinic.name}
								</div>
								<div className="text-base text-gray-600">
									{getSpecializations(agenda.doctor)}
								</div>
								<Show if={agenda.doctor != null}>
									<RatingView value={agenda.doctor?.rating ?? 0} />
								</Show>
								<div className="flex flex-col items-start self-start px-4 mt-6 gap-y-1">
									<div className="flex items-center gap-x-2">
										<MapPinIcon className="h-5 text-gray-400" />
										{agenda.clinic.address} {agenda.clinic.city}
									</div>
									<div className="flex items-center gap-x-2">
										<PhoneIcon className="h-5 text-gray-400" />
										{agenda.clinic.phoneNumber}
									</div>
									<div className="flex items-center gap-x-2">
										<ReceiptPercentIcon className="h-5 text-gray-400" />
										<div className="flex-grow">Prestazione</div>
										<div className="font-semibold">50,00€</div>
									</div>
								</div>
								<a
									href={`/book/${agenda.id}`}
									className="absolute bottom-0 left-0 font-bold text-gray-600 right-0 text-center py-3 rounded-b-xl group-hover:bg-primary group-hover:text-white cursor-pointer border-t"
								>
									PRENOTA
								</a>
							</div>
						</div>
					))}
				</div>
			</Show>
			<div className="fixed top-2 right-2">
				<LinkButton dark={true} to="/login" text="Accedi" minimal />
			</div>
		</div>
	);
}
