import type { Doctor } from "@prisma/client";
import SelectField from "./selectField";

export default function DoctorField(p: {
  name?: string;
  label?: string;
  doctors: Doctor[];
}) {
  const options = [
    { value: "", label: "-" },
    ...p.doctors.map((d) => ({
      value: d.id,
      label: `${d.firstName ?? ""} ${d.lastName ?? ""}`,
    })),
  ];
  return (
    <SelectField
      name={p.name ?? "doctorId"}
      label={p.label ?? "Dottore"}
      options={options}
    />
  );
}
