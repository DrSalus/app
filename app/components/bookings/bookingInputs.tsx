import { useControlField } from "remix-validated-form";
import InputField from "../fields/inputField";
import PhoneInputField from "../fields/phoneInputField";
import type { Option } from "../fields/selectField";
import SelectField from "../fields/selectField";
import React from "react";
import classNames from "classnames";

export default function BookingInputs(p: {
  className?: string;
  services: Option[];
}) {
  const [date] = useControlField<string | null>("date");
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
      />
    </div>
  );
}
