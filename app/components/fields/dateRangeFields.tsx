import Field from "../field";
import InputField from "./inputField";

export default function DateRangeFields(p: {
	type: "date" | "datetime";
	label: string;
	name: [string, string];
}) {
	return (
		<Field name="" label={p.label}>
			<div className="flex flex-grow items-center gap-x-4">
				<div className="flex-grow">
					<InputField
						name={p.name[0]}
						inputProps={{ type: p.type }}
						label=""
						showError={false}
						showLabel={false}
					/>
				</div>
				<div className="h-8">al</div>
				<div className="flex-grow">
					<InputField
						name={p.name[1]}
						inputProps={{ type: p.type }}
						label=""
						showError={false}
						showLabel={false}
					/>
				</div>
			</div>
		</Field>
	);
}
