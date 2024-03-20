import type { ServiceOffering, ClinicalService, User } from "@prisma/client";
import type { WithSerializedTypes } from "~/utils/client";
import RelationshipField from "../relationshipField";
import { getDisplayName } from "~/utils/patient";

type Type = WithSerializedTypes<Pick<User, "id" | "firstName" | "lastName">>;

export default function UsersField(p: {
	name: string;
	label?: string;
	helperText?: string;
	options: Type[];
}) {
	return (
		<RelationshipField
			{...p}
			options={p.options.map((d) => ({
				id: d.id,
				name: getDisplayName(d),
			}))}
		/>
	);
}
