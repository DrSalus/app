import {
	ClockIcon,
	PencilSquareIcon,
	PlusIcon,
	ReceiptPercentIcon,
	XMarkIcon,
} from "@heroicons/react/24/solid";
import {
	type Agenda,
	type Doctor,
	ClinicalService,
	ServiceOffering,
	AgendaPlan,
} from "@prisma/client";
import type { WithSerializedTypes } from "~/utils/client";
import Button from "~/components/button";
import Overlay, { DialogCloseOnSubmit } from "~/components/overlay";
import { ValidatedForm } from "remix-validated-form";
import { validator } from "~/validators/agenda";
import InputField from "~/components/fields/inputField";
import { last } from "lodash-es";
import { v4 } from "uuid";
import { useMatches } from "@remix-run/react";
import DoctorField from "~/components/fields/doctorField";
import ServiceTypeField from "~/components/fields/serviceTypeField";
import ServicesField from "~/components/fields/servicesField";
import { DateTime } from "luxon";
import DateRangeFields from "~/components/fields/dateRangeFields";
import Tab from "~/components/tab";
import { useMemo, useState } from "react";
import classNames from "classnames";
import TimeRange from "~/components/fields/timeRangeField";
import Show from "~/components/show";
import FormDebug from "~/components/formDebug";

export type AgendaWithPlans = Agenda & {
	plans: AgendaPlan[];
	services?: ClinicalServiceOffering[];
};
export type ClinicalServiceOffering = ServiceOffering & {
	service: ClinicalService;
};

export function AgendaDialog(p: {
	agenda?: WithSerializedTypes<AgendaWithPlans | null>;
	doctors?: Doctor[];
	services?: WithSerializedTypes<ClinicalServiceOffering>[];
	redirectTo?: string;
	source?: string;
	clinicId: string;
	isOpen: boolean;
	onClose?: () => void;
}) {
	const isNew = p.agenda == null;
	const [selectedTab, setSelectedTab] = useState("info");
	const matches = useMatches();
	const redirectTo = p.redirectTo ?? last(matches)?.pathname;
	const plan = p.agenda?.plans?.[0] ?? {};
	let agenda = !isNew ? { ...plan, ...p.agenda } : null;
	if (agenda != null) {
		agenda.validFrom =
			agenda.validFrom != null
				? DateTime.fromISO(agenda.validFrom).toISODate()
				: null;
		agenda.validUntil =
			agenda.validUntil != null
				? DateTime.fromISO(agenda.validUntil).toISODate()
				: null;
	}
	const key = useMemo(() => {
		return p.agenda?.id ?? v4();
	}, [p.isOpen, p.agenda]);
	return (
		<Overlay isOpen={p.isOpen}>
			<div className="card w-3/5 z-10">
				<h2 className="border-none">
					{isNew ? "Aggiungi Agenda" : "Modifica Agenda"}
				</h2>
				<div className="flex bg-gray-50 divide-gray-200 divide-y-0 divide-x  items-stretch text-sm font-semibold -mt-4 mb-2 border  rounded overflow-hidden">
					<Tab
						selectedTab={selectedTab}
						tab={{
							id: "info",
							title: "Informazioni",
							icon: <PencilSquareIcon />,
						}}
						onClick={() => setSelectedTab("info")}
					/>
					<Tab
						selectedTab={selectedTab}
						tab={{
							id: "timeslots",
							title: "Disponibilità",
							icon: <ClockIcon />,
						}}
						onClick={() => setSelectedTab("timeslots")}
					/>
					<Show if={p.services != null}>
						<Tab
							selectedTab={selectedTab}
							tab={{
								id: "services",
								title: "Prestazioni",
								icon: <ReceiptPercentIcon />,
							}}
							onClick={() => setSelectedTab("services")}
						/>
					</Show>
				</div>

				<XMarkIcon className="close-button" onClick={p.onClose} />
				<ValidatedForm
					method="post"
					key={key}
					validator={validator}
					resetAfterSubmit={true}
					defaultValues={agenda}
					encType="multipart/form-data"
					action="/agendas/upsert"
				>
					<DialogCloseOnSubmit onClose={p.onClose} />
					<input
						type="hidden"
						value={isNew ? "create" : "update"}
						name="_action"
					/>
					<input type="hidden" name="_redirect" value={redirectTo} />
					<input type="hidden" name="_source" value={p.source} />
					<input type="hidden" name="_id" value={p.agenda?.id} />
					<input
						type="hidden"
						name="clinicId"
						value={p.agenda?.clinicId ?? p.clinicId}
					/>
					<div
						className={classNames("form-grid px-4 pt-4", {
							hidden: selectedTab !== "info",
						})}
					>
						<InputField name="name" label="Nome" />
						<ServiceTypeField />
						<Show if={p.doctors != null}>
							<DoctorField doctors={p.doctors ?? []} />
						</Show>
						<DateRangeFields
							type="date"
							name={["validFrom", "validUntil"]}
							label="Valido dal"
						/>
						<InputField
							inputProps={{ type: "number" }}
							name="slotInterval"
							label="Slot di Prenotazione"
						/>
					</div>
					<Show if={p.services != null}>
						<div
							className={classNames("form-grid px-4 pt-4", {
								hidden: selectedTab !== "services",
							})}
						>
							<ServicesField name="services" options={p.services ?? []} />
						</div>
					</Show>

					<div
						className={classNames("form-grid px-4 pt-4", {
							hidden: selectedTab !== "timeslots",
						})}
					>
						<TimeRange label="Lunedì" name="mon" />
						<TimeRange label="Martedì" name="tue" />
						<TimeRange label="Mercoledì" name="wed" />
						<TimeRange label="Giovedì" name="thu" />
						<TimeRange label="Venerdì" name="fri" />
						<TimeRange label="Sabato" name="sat" />
						<TimeRange label="Domenica" name="sun" />
					</div>
					<div className="p-4 pb-2">
						<Button
							intent="primary"
							className="w-full"
							type="submit"
							text={isNew ? "Aggiungi Agenda" : "Modifica Agenda"}
							icon={<PlusIcon />}
						/>
					</div>
					{/* <FormDebug /> */}
				</ValidatedForm>
			</div>
		</Overlay>
	);
}
