import { compact } from "lodash-es";

export function getDisplayName(
	p: { firstName?: string; lastName?: string } | null,
) {
	return compact([p?.firstName, p?.lastName]).join(" ");
}
