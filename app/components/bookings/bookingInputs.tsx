import { useControlField } from "remix-validated-form";
import InputField from "../fields/inputField";
import PhoneInputField from "../fields/phoneInputField";
import type { Option } from "../fields/selectField";
import SelectField from "../fields/selectField";
import React from "react";
import classNames from "classnames";
import { useLocation, useSearchParams } from "@remix-run/react";

export default function BookingInputs(p: {
	className?: string;
	services: (Option & { serviceId: string })[];
}) {
	const [date] = useControlField<string | null>("date");
	const [params] = useSearchParams();
	const sercice = params.get("service");

	if (date == null) return <React.Fragment />;
	return (
		<div className={classNames("flex flex-col gap-y-1 px-4", p.className)}>
			<InputField name="firstName" label="Nome" />
			<InputField name="lastName" label="Cognome" />
			<PhoneInputField name="phoneNumber" label="Numero di Telefono" />
			<InputField name="emailAddress" label="Indirizzo Email" />
			<SelectField
				name="serviceId"
				label="Servizio"
				placeholder="Scegli un servizio..."
				options={p.services}
				defaultValue={p.services?.find(
					(d) => d.serviceId === params.get("service"),
				)}
			/>
		</div>
	);
}
