// This component is used to display a time range field in the form, using tailwindcss. It should

import classNames from "classnames";
import Field from "../field";
import {
	ArrowRightIcon,
	CursorArrowRaysIcon,
	TrashIcon,
} from "@heroicons/react/24/solid";
import Button from "../button";

// show a time range picker, with a start and end time.
export default function TimeRange(p: {
	label: string;
	name: string;
	className?: string;
	fromHour?: string;
	toHour?: string;
}) {
	const fromHour = p.fromHour ?? "07:00";
	const toHour = p.toHour ?? "20:00";
	return (
		<Field label={p.label} name={p.name}>
			<div className="input-row-container flex items-center gap-x-2">
				<div className="flex items-center border rounded gap-x-2 pl-2">
					<input type="time" name={p.name} className="w-20" />
					<ArrowRightIcon className="h-4 text-gray-500" />
					<input type="time" name={p.name} className="w-20" />
					<Button icon={<TrashIcon />} intent="danger" minimal small />
				</div>
			</div>
		</Field>
	);
}
