import { CalendarDaysIcon } from "@heroicons/react/24/solid";
import { LoaderFunctionArgs, SerializeFrom } from "@remix-run/node";
import { useLoaderData, useNavigate, useSearchParams } from "@remix-run/react";
import { get, isEmpty, times } from "lodash-es";
import { DateTime } from "luxon";
import { useState } from "react";
import { ClientOnly } from "remix-utils/client-only";
import AgendaDetail from "~/components/agenda/agendaDetail";
import CalendarStream, { DAYS } from "~/components/calendarStream";
import { DailyAgendaView } from "~/components/dailyAgendaViewer";
import NonIdealState from "~/components/nonIdealState";
import Show from "~/components/show";
import { DailyCalendarSlot } from "~/components/simpleCalendar";
import { authenticator } from "~/services/auth.server";
import { getCalendarSlots } from "~/utils/calendar";
import { db } from "~/utils/db.server";
import useStopPropagation from "~/utils/events";

import { loader as agendaLoader } from "~/services/agendas";
import AgendaManager from "~/components/agenda/agendaManager";

export const loader = async (args: LoaderFunctionArgs) => {
	return agendaLoader(args);
};

export default function AgendaPage() {
	return <AgendaManager />;
}
