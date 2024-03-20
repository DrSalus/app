import { CalendarDaysIcon } from "@heroicons/react/24/solid";
import { useLoaderData, useSearchParams } from "@remix-run/react";
import { get, isEmpty } from "lodash-es";
import { ClientOnly } from "remix-utils/client-only";
import AgendaDetail from "~/components/agenda/agendaDetail";
import CalendarStream, { DAYS } from "~/components/calendarStream";
import { DailyAgendaView } from "~/components/dailyAgendaViewer";
import NonIdealState from "~/components/nonIdealState";
import Show from "~/components/show";
import { loader } from "~/services/agendas";

export default function AgendaManager() {
	const { agenda, slots, date, booking } = useLoaderData<typeof loader>();
	const [searchParams, setSearchParams] = useSearchParams();
	const slot = searchParams.get("slot");
	const selectedSlot = slots[0].slots.find((d) => d.time === slot);
	const hasSlots = slots[0].slots.length > 0;
	const agendaPlan =
		agenda.plans?.[0] ?? DAYS.reduce((p, n) => ({ [n]: null, ...p }), {});
	return (
		<div className="flex flex-col items-stretch flex-grow -mt-4 min-h-0">
			<ClientOnly>
				{() => (
					<CalendarStream
						enabledDays={DAYS.filter((f) => !isEmpty(get(agendaPlan, f)))}
						className="bg-white shadow-md sticky top-0 z-10"
						onChangeDate={(date) => {
							setSearchParams((prev) => {
								prev.set("date", date.toISOString());
								return prev;
							});
						}}
						date={date}
					/>
				)}
			</ClientOnly>
			<div className="flex items-start mt-4 px-4 gap-x-2 flex-grow pb-4">
				<Show if={hasSlots}>
					<DailyAgendaView
						className="w-1/2 overflow-scroll max-h-[74vh]"
						agenda={agenda}
						onSelectSlot={(slot) => {
							setSearchParams((prev) => {
								if (slot != null) {
									prev.set("slot", slot?.time);
								} else {
									prev.delete("slot");
								}
								return prev;
							});
						}}
						selectedSlot={selectedSlot}
						calendar={slots[0]}
					/>
				</Show>
				<Show unless={hasSlots}>
					<div className="rounded-lg w-1/2 border shadow bg-white flex flex-col items-center relative py-4 min-h-0">
						<NonIdealState
							title="Agenda Non Disponibile"
							description="Per questo giorno non è disponibile alcuno slot, controlla la configurazione della agenda."
							icon={<CalendarDaysIcon />}
						/>
					</div>
				</Show>
				<AgendaDetail
					slot={slot}
					agenda={agenda}
					booking={booking}
					className="w-1/2"
				/>
			</div>
		</div>
	);
}
