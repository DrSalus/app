import type { Clinic, Doctor } from "@prisma/client";
import SelectField from "./selectField";
import { WithSerializedTypes } from "~/utils/client";

export default function ClinicField(p: {
	name?: string;
	label?: string;
	clinics: WithSerializedTypes<Pick<Clinic, "id" | "name">>[];
}) {
	const options = [
		{ value: "", label: "-" },
		...p.clinics.map((d) => ({
			value: d.id,
			label: d.name,
		})),
	];
	return (
		<SelectField
			name={p.name ?? "clinicId"}
			label={p.label ?? "Clinica"}
			options={options}
		/>
	);
}
