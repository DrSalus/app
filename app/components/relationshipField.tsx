import { useControlField, useFieldArray } from "remix-validated-form";
import { PlusIcon, TrashIcon } from "@heroicons/react/24/solid";
import { useMemo, useState } from "react";
import Field from "./field";
import { ValueField } from "./fields/valueField";
import Button from "./button";
import { Select } from "./select";

function ServiceNameFallback<Value extends { id: string; name: string }>(p: {
	name: string;
	options: Value[];
}) {
	const [value] = useControlField<string>(p.name);
	return <>{p.options.find((d) => d.id === value)?.name ?? ""}</>;
}

export default function RelationshipField<
	Value extends { id: string; name: string },
>(p: { name: string; label?: string; helperText?: string; options: Value[] }) {
	const [items, { push, remove }] = useFieldArray<{ id: string; name: string }>(
		p.name,
	);
	const [control] = useControlField<{ id: string; name: string }[]>(p.name);
	const [value, setValue] = useState<Value | null>(null);
	const options = useMemo(() => {
		const ids = control?.map((d) => d.id) ?? [];
		return p.options
			.filter((f) => !ids.includes(f.id))
			.map((o) => ({ label: o.name, value: o.id }));
	}, [control, p.options]);
	return (
		<Field
			name={p.name}
			label={p.label ?? "Prestazioni"}
			helperText={p.helperText}
		>
			<div className="flex flex-col rounded divide-y input p-0">
				{items.map((d, index) => (
					<div key={d.key} className="flex items-center px-2 pl-4 py-1.5">
						<div className="flex-grow">
							<ValueField showValue={false} name={`${p.name}[${index}].id`} />
							<ValueField
								name={`${p.name}[${index}].name`}
								defaultValue={
									<ServiceNameFallback
										name={`${p.name}[${index}].id`}
										options={p.options}
									/>
								}
							/>
						</div>
						<Button
							onClick={() => remove(index)}
							minimal
							small
							intent="danger"
							icon={<TrashIcon />}
						/>
					</div>
				))}

				<div className="flex flex-grow items-center gap-x-2 pr-1">
					<Select
						value={
							value != null ? { value: value.id, label: value.name } : null
						}
						onChangeValue={(e) => {
							const value = p.options.find((s) => s.id === e?.value);
							if (value != null) {
								setValue(value);
							}
						}}
						minimal={true}
						className="input flex-grow border-none mb-0 p-0"
						options={options}
					/>

					<Button
						intent="primary"
						icon={<PlusIcon />}
						disabled={value == null}
						onClick={() => {
							if (value != null) {
								push({
									id: value.id,
									name: value.name,
								});
								setValue(null);
							}
						}}
					/>
				</div>
			</div>
		</Field>
	);
}
