import { ClinicalService, ServiceType } from "@prisma/client";
import SelectField from "./selectField";
import { WithSerializedTypes } from "~/utils/client";
import { useControlField } from "remix-validated-form";

export default function ServiceField({ services }: { services: WithSerializedTypes<ClinicalService>[]; }) {

  const [type] = useControlField<ServiceType | null>("type");
  const options = services.filter(f => type == null || f.type === type).map((d) => ({
    value: d.id,
    label: d.name,
  }))
  return (
    <SelectField
      name="serviceId"
      label="Prestazione"
      options={[
        { label: '-', value: '' },
        ...options,
      ]}
    />);

}