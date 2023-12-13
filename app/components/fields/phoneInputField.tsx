import { useControlField } from "remix-validated-form";
import Field from "../field";
import PhoneInput from "react-phone-number-input";
import type { Value } from "react-phone-number-input";
import "react-phone-number-input/style.css";
import React from "react";
import classNames from "classnames";

export default function PhoneInputField(p: { name: string; label: string }) {
  const [value, setValue] = useControlField<Value | undefined>(p.name);
  console.log(value);
  return (
    <Field name={p.name} label={p.label}>
      <PhoneInput
        value={value}
        onChange={setValue}
        defaultCountry="IT"
        inputComponent={CustomInput}
      />
    </Field>
  );
}

const CustomInput = React.forwardRef<HTMLInputElement>(
  (
    p: React.DetailedHTMLProps<
      React.InputHTMLAttributes<HTMLInputElement>,
      HTMLInputElement
    >,
    ref
  ) => {
    return (
      <input
        ref={ref}
        {...p}
        name="phoneNumber"
        className={classNames(p.className, "input")}
      />
    );
  }
);
