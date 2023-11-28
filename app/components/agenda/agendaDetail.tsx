import { Agenda, ServiceBooking } from "@prisma/client";
import { useRouteLoaderData } from "@remix-run/react";
import classNames from "classnames";
import { AgendaBooking } from "~/routes/clinic.$id.agenda.$agendaId";
import { WithSerializedTypes } from "~/utils/client";
import { getDisplayName } from "~/utils/patient";

export default function AgendaDetail(p: {
	agenda: WithSerializedTypes<Agenda>;
	className?: string;
	booking?: AgendaBooking;
}) {
	if (p.booking != null) {
		return (
			<div
				className={classNames("bg-white rounded border shadow", p.className)}
			>
				{getDisplayName(p.booking.patient)}
			</div>
		);
	} else {
		return <div>AAA</div>;
	}
}
