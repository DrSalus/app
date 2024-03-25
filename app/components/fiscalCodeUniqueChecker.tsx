import { useEffect, useState } from "react";
import {
	useControlField,
	useField,
	useFormContext,
} from "remix-validated-form";
import Show from "./show";
import Callout from "./callout";

export function useFiscalCodeUniqueChecker(
	name: string,
	id?: string,
	onUpdateUnique?: (unique: boolean) => void,
) {
	const [value] = useControlField(name ?? "fiscalCode");
	const [unique, setUnique] = useState(true);
	useEffect(() => {
		fetch(`/fiscalCode?query=${value}&id=${id}`)
			.then((r) => r.json())
			.then((r) => {
				const unique = r.result === false;
				setUnique(unique);
				onUpdateUnique?.(unique);
			});
	}, [value, id, onUpdateUnique]);
	return unique;
}

export default function FiscalCodeUniqueChecker(p: {
	id?: string;
	name?: string;
	message?: string;
	onUpdateUnique?: (unique: boolean) => void;
	className?: string;
	intent?: "success" | "danger" | "warning";
}) {
	const unique = useFiscalCodeUniqueChecker(
		p.name ?? "fiscalCode",
		p.id,
		p.onUpdateUnique,
	);

	return (
		<Show unless={unique}>
			<div className={p.className}>
				<Callout
					text={
						p.message ??
						"Il codice fiscale inserito risulta già presente in piattaform."
					}
					intent={p.intent ?? "danger"}
				/>
			</div>
		</Show>
	);
}
