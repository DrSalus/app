import {
	BuildingOfficeIcon,
	HeartIcon,
	PhoneArrowDownLeftIcon,
	WrenchIcon,
} from "@heroicons/react/24/solid";
import { UserKind } from "~/utils/enum";
import classNames from "classnames";
import React from "react";

export function UserKindTag(p: { kind: UserKind }) {
	let icon: JSX.Element = <React.Fragment />;
	let colors = "";
	let text = "";
	const iconClassName = "h-4";
	switch (p.kind) {
		case UserKind.ADMIN:
			colors = "bg-orange-100 text-orange-800";
			icon = <WrenchIcon className={iconClassName} />;
			text = "Admin";
			break;
		case UserKind.DOCTOR:
			colors = "bg-red-100 text-red-800";
			icon = <HeartIcon className={iconClassName} />;
			text = "Dottore";
			break;
		case UserKind.DOCTOR_ASSISTANT:
			colors = "bg-sky-100 text-sky-800";
			icon = <PhoneArrowDownLeftIcon className={iconClassName} />;
			text = "Accettazione";
			break;
		case UserKind.CLINIC_MANAGER:
			colors = "bg-yellow-100 text-yellow-800";
			icon = <BuildingOfficeIcon className={iconClassName} />;
			text = "Gestore Struttura";
			break;
	}
	return (
		<div
			className={classNames(
				"flex items-center gap-x-2 px-2 py-0.5 font-medium text-sm rounded",
				colors,
			)}
		>
			{icon}
			<div>{text}</div>
		</div>
	);
}
