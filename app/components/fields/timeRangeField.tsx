// This component is used to display a time range field in the form, using tailwindcss. It should

import Field from "../field";
import { ArrowRightIcon, PlusIcon, TrashIcon } from "@heroicons/react/24/solid";
import Button from "../button";
import { useCallback } from "react";
import { useControlField, useFormContext } from "remix-validated-form";
import { cloneDeep, isEmpty, set } from "lodash-es";
import useStopPropagation from "~/utils/events";
import Show from "../show";

interface TimeRange {
	from: string;
	to: string;
}

// show a time range picker, with a start and end time.
export default function TimeRangeField(p: {
	label: string;
	name: string;
	className?: string;
	fromHour?: string;
	toHour?: string;
}) {
	const [value, setValue] = useControlField<TimeRange[]>(p.name);
	const { fieldErrors } = useFormContext();
	const stopPropagation = useStopPropagation();

	const from = p.fromHour ?? "09:00";
	const to = p.toHour ?? "20:00";

	const handleToggleCheck = useCallback(
		(event: React.ChangeEvent<HTMLInputElement>) => {
			if (isEmpty(value)) {
				setValue([
					{
						from,
						to,
					},
				]);
			} else {
				setValue([]);
			}
		},
		[value, to, from, setValue],
	);

	return (
		<>
			<div
				className="col-span-2 flex  items-center gap-x-2 cursor-pointer text-gray-600 hover:text-gray-900 "
				onClick={handleToggleCheck}
				onKeyDown={handleToggleCheck}
			>
				<input
					type="checkbox"
					checked={!isEmpty(value)}
					onChange={handleToggleCheck}
				/>
				<div>{p.label}</div>
			</div>
			<div
				className="input-row-container  flex flex-wrap gap-y-1 items-center gap-x-2"
				{...stopPropagation}
			>
				{value?.map((val, index) => (
					<div
						key={index}
						className="flex items-center border rounded gap-x-2 pl-2"
						{...stopPropagation}
					>
						<input
							type="time"
							defaultValue={val.from}
							name={`${p.name}.${index}.from`}
							onChange={(e) => {
								setValue(
									set(cloneDeep(value), `${index}.from`, e.target.value),
								);
							}}
							className="w-20"
						/>
						<ArrowRightIcon className="h-4 text-gray-500" />
						<input
							type="time"
							defaultValue={val.to}
							name={`${p.name}.${index}.to`}
							onChange={(e) => {
								setValue(set(cloneDeep(value), `${index}.to`, e.target.value));
							}}
							className="w-20"
						/>
						<Button
							icon={<TrashIcon />}
							intent="danger"
							minimal
							small
							onClick={() => setValue(value.filter((_, j) => index !== j))}
						/>
					</div>
				))}
				<Show if={value?.length > 0}>
					<Button
						icon={<PlusIcon />}
						minimal
						small
						onClick={(e) => {
							setValue([...cloneDeep(value), { from, to }]);
						}}
					/>
				</Show>
			</div>
		</>
	);
}
