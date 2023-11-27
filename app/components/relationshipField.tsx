import { useControlField, useFieldArray } from "remix-validated-form";
import { PlusIcon, TrashIcon } from "@heroicons/react/24/solid";
import { useState } from "react";
import Field from "./field";
import { ValueField } from "./fields/valueField";
import Button from "./button";

function ServiceNameFallback<Value extends { id: string; name: string }>(p: {
  name: string;
  options: Value[];
}) {
  const [value] = useControlField<string>(p.name);
  return <>{p.options.find((d) => d.id === value)?.name ?? ""}</>;
}

export default function RelationshipField<
  Value extends { id: string; name: string }
>(p: { name: string; label?: string; helperText?: string; options: Value[] }) {
  const [items, { push, remove }] = useFieldArray<{ id: string; name: string }>(
    p.name
  );
  const [value, setValue] = useState<Value | null>(null);
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

        <div className="flex flex-grow items-center gap-x-2">
          <select
            value={value?.id ?? ""}
            onChange={(e) => {
              const value = p.options.find((s) => s.id === e.target.value);
              if (value != null) {
                setValue(value);
              }
            }}
            className="input flex-grow border-none mb-0"
          >
            <option value="">-</option>
            {p.options.map((offering) => (
              <option key={offering.id} value={offering.id}>
                {offering.name}
              </option>
            ))}
          </select>
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
