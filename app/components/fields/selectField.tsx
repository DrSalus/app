import { useControlField, useField } from "remix-validated-form";
import Field, { FieldProps } from "../field";
import classNames from "classnames";
import { isObject } from "lodash-es";

interface Option {
  value: string;
  label?: string;
}

interface SelectFieldProps extends Omit<FieldProps, "children"> {
  options: (string | Option)[];
  defaultValue?: string;
  minimal?: boolean;
  placeholder?: string;
  renderDisplayName?: (val: string) => string;
}

export default function SelectField({
  name,
  label,
  helperText,
  defaultValue,
  options,
  ...p
}: SelectFieldProps) {
  const { error, getInputProps } = useField(name);
  const [value, setValue] = useControlField<string>(name);

  return (
    <Field name={name} label={label} helperText={helperText}>
      <select
        defaultValue={defaultValue}
        className={classNames("input", {
          error: error,
        })}
        {...getInputProps({
          id: name,
          value,
          onChange: (e) => setValue((e.target as any).value),
        })}
      >
        {options.map((d) =>
          isObject(d) ? (
            <option key={d.value} value={d.value}>
              {d.label ?? d.value}
            </option>
          ) : (
            <option key={d} value={d}>
              {p.renderDisplayName?.(d) ?? d}
            </option>
          )
        )}
      </select>
    </Field>
  );
}
