import { useFieldArray } from "remix-validated-form";
import Button from "../button";
import InputField from "./inputField";
import { ValueField } from "./valueField";
import { PlusIcon, TrashIcon } from "@heroicons/react/24/solid";
import { WithSerializedTypes } from "~/utils/client";
import { ClinicalService, ServiceOffering } from "@prisma/client";
import { useState } from "react";

export default function ServicesField(p: { name: string; services: WithSerializedTypes<ServiceOffering & { service: ClinicalService }>[] }) {
  const [items, { push, remove }] = useFieldArray<{ id: string; name: string }>(p.name);
  const [value, setValue] = useState<ClinicalService | null>(null);
  return (
    <div className="flex flex-col border rounded divide-y">
      {items.map((d, index) => (
        <div className="flex items-center px-2 pl-4 py-1">
          <div className="flex-grow"><ValueField name={`${p.name}[${index}].name`} /></div>
          <Button onClick={() => remove(index)} minimal small icon={<TrashIcon />} />
        </div>
      ))}


      <div className="flex items-center">
        <select value={value?.id ?? ''} onChange={(e) => {
          const service = p.services.find(s => s.serviceId === e.target.value);
          if (service != null) {
            setValue(service.service);
          }
        }} className="input">
          <option value=""></option>
          {p.services.map(offering => (
            <option value={offering.serviceId}>{offering.service.name}</option>
          ))}
        </select>
        <Button intent="primary" icon={<PlusIcon />} onClick={() => {
          push(value)
          setValue(null);
        }} />
      </div>
    </div>
  )
}

