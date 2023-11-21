import { ServiceType } from "@prisma/client";
import SelectField from "./selectField";

export default function ServiceTypeField(p: { name?: string; label?: string }) {
  return (
    <SelectField
    name={p.name ?? 'type'}
    label={p.label ?? 'Tipologia'}
    options={[
      { value: "", label: "-" },
      { value: ServiceType.VISIT, label: "Visita Medica" },
      { value: ServiceType.LAB, label: "Esame Laboratorio" },
      { value: ServiceType.INSTRUMENTAL, label: "Esame Strumentale" },
    ]}
  />
  )
}