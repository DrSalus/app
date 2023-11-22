import { useControlField, useFieldArray } from "remix-validated-form";
import Button from "../button";
import InputField from "./inputField";
import { ValueField } from "./valueField";
import { PlusIcon, TrashIcon } from "@heroicons/react/24/solid";
import { WithSerializedTypes } from "~/utils/client";
import { ClinicalService, ServiceOffering } from "@prisma/client";
import { useState } from "react";
import Field from "../field";

type Value = WithSerializedTypes<
  ServiceOffering & { service: ClinicalService }
>;

function ServiceNameFallback(p: { name: string; services: Value[] }) {
  const [value] = useControlField<string>(p.name);
  return <>{p.services.find((d) => d.id === value)?.service.name ?? ""}</>;
}

export default function ServicesField(p: {
  name: string;
  label?: string;
  helperText?: string;
  services: Value[];
}) {
  const [items, { push, remove }] = useFieldArray<{ id: string; name: string }>(
    p.name,
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
          <div className="flex items-center px-2 pl-4 py-1.5">
            <div className="flex-grow">
              <ValueField showValue={false} name={`${p.name}[${index}].id`} />
              <ValueField
                name={`${p.name}[${index}].name`}
                defaultValue={
                  <ServiceNameFallback
                    name={`${p.name}[${index}].id`}
                    services={p.services}
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
              const service = p.services.find((s) => s.id === e.target.value);
              if (service != null) {
                setValue(service);
              }
            }}
            className="input flex-grow border-none mb-0"
          >
            <option value="">-</option>
            {p.services.map((offering) => (
              <option value={offering.id}>{offering.service.name}</option>
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
                  name: value.service.name,
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
